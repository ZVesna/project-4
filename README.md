### ![GA](https://cloud.githubusercontent.com/assets/40461/8183776/469f976e-1432-11e5-8199-6ac91363302b.png)
### General Assembly, Software Engineering Immersive
# Folio


by [Clement Knox](https://github.com/clem-code), [Vesna Zivanovic](https://github.com/ZVesna) and [Tom Briody](https://github.com/Thomas-Briody) 

## Overview

This is the final project of the Software Engineering Immersive course at GA London. The assignment was to create a **full-stack application** within **one week**, and we chose to complete it in a **team of three**. 

**Folio** is a clone of popular e-trading platforms, where the user can sign up as a retail investor, browse and research stocks and cryptocurrencies, purchase assets (each user is provided with 100,000 dollars upon registration), and monitor the performance of their portfolio. Folio's database contains 26,000 US equities and over 5,000 cryptocurrencies.

<img align = 'center' src='https://i.imgur.com/7nFYHe4.png' >

Backend is built using Python, Flask, Marshmallow and SQLAlchemy - to create relationships between the users, the assets on sale, and the transaction objects that recorded sales and purchases. Frontend is built using React, and styled with Semantic React UI. In order to include some simple data visualizations, we used React Viz to provide a simple line chart of the stock/coin's three-month performance on the individual asset page.

You can launch the app on Heroku [here](https://foliotrade.herokuapp.com/), or find the GitHub repo [here](https://github.com/ZVesna/project-4).

---
***NOTE***

If you would like to test the app, you can create your own account (the email address does not need to be real).

---


## Brief

Requirements:

* Choose to work solo or in a team
* **Build a full-stack application** by making your own backend and your own frontend
* **Use a Python Flask API** using a Flask REST Framework to serve your data from a Postgres database
* **Consume your API with a separate frontend** built with React
* **Be a complete product** which most likely means multiple relationships and CRUD functionality for at least a couple of models
* **Implement thoughtful user stories/wireframes** that are significant enough to help you know which features are core MVP and which you can cut
* **Have a visually impressive design** to kick your portfolio up a notch and have something to wow future clients & employers 
* **Be deployed online** so it's publicly accessible


## Technologies used

**Frontend:**

- HTML5
- JavaScript (ES6)
- SASS
- Semantic React UI
- React
- React Router
- Webpack
- Local Storage

**Backend:**

- Python
- Flask
- Marshmallow
- SQLAlchemy
- PostgreSQL
- Insomnia

**External Libraries:**

- Axios
- React.viz
- Bcrypt

**Other:**

- GitHub
- Git
- Heroku

## Approach

### Planning

The basic idea of building a trading platform as our final project was something we individually came up with. Thousands of different assets, data displayed in graphs and charts, real-time pricing, ability to buy and sell assets and see everything dynamically calculated on the portfolio page, seemed like the ideal project. With all the creativity in place, the main goal was to demonstrate how to use APIs (our own and those of third parties), to build something a bit more ambitious than a CRUD application.

After a brief group discussion, we came up with an initial plan of how the website should be structured on the backend and the frontend.

<img align = 'center' src='https://i.imgur.com/3tNZnJz.png' >

*An early blueprint for our frontend.*

We decided to complete the backend together via pair-programming, and conduct thorough testing before moving on to the frontend. This was important for several reasons - version control would be a big issue at such an early stage, and it was important that we all start out with backends structured in the same way. Even though our backend was pretty simple, working out the relationships between users, assets and transactions was something we had to be careful with.

Although we were keen to make sure that everyone equally participated, it made sense to split the work initially to get the skeleton of the website up and running. This meant that everyone took ownership of certain parts of the code - I built the Homepage, Footer, Register and Login pages.

Then we all spent time revising, debugging and restyling all the different parts of the website. To challenge ourselves with a new CSS framework, we agreed at the beginning to use Semantic React UI to build the various components. This helped standardise the look of the app, but brought plenty of challenges along with it.


### Backend

**Models**

Folio's backend was built using Python, Flask, Marshmallow and SQLAlchemy. Essentially, we built our API using a Model-View-Controller (MVC) pattern to structure the endpoints. At a very high level, there were two basic data collections: users and assets. We had a model for a user and a model for an asset, and then views and controllers for each.

***User Model***

The user is defined by the following information: username, email, password and wallet (starting at the default of 100,000 dollars).

  ```py
  class User(db.Model, BaseModel):

    __tablename__ = "users"

    username = db.Column(db.String(50), nullable=False, unique=True)
    email = db.Column(db.Text, nullable=False, unique=True)
    wallet = db.Column(db.Float, nullable=False)
    password_hash = db.Column(db.String(128), nullable=True)

    # ? Create a relationship field to trades
    trades = db.relationship("Trade", backref="user", cascade="all, delete")
    # ? Create a relationship field to stocks
    favourites = db.relationship("Stock", backref="user", cascade="all, delete", secondary=users_stocks_join)
  ```

As security concerns were paramount for the user model, we used Bcrypt to provide basic data protection for user information.

***Asset Model***

The asset model was quite simple. It consisted of three pieces of information: the asset name (e.g. 'Tesla'), the asset symbol ('TSLA'), and the asset type ('stock' or 'crypto'). We kept the backend data for the assets lightweight because it would have been very difficult to keep up-to-date financial information on 31,000 assets on our backend. Instead, we wanted to use these simple pieces of data to speak to third-party APIs that held current asset information.

***Trade Model***

Our user model interacted with our stock model in two crucial ways. When the user bought or sold an asset, they generated a trade object that recorded the details of the transaction. This included a relationship between the trade object and the user who had generated it (user id), as well as the asset being traded (stock id). These were both **many-to-one** relationships.

  ```py
  class Trade(db.Model, BaseModel):

    __tablename__ = "trades"

    name_of_asset = db.Column(db.String(100), nullable=False)
    asset_price = db.Column(db.Float, nullable=False)
    qty_purchased = db.Column(db.Float, nullable=False)
    total_trade_value = db.Column(db.Float, nullable=False)
    transaction_type = db.Column(db.String(10), nullable=False)
    asset_type = db.Column(db.String(10), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"))
    stock_id = db.Column(db.Integer, db.ForeignKey("stocks.id", ondelete="CASCADE"))
  ```

***Join Table***

There was also a **many-to-many** relationship in our database. We wanted a 'Favourites' functionality that would allow users to browse and favourite assets that they could then later purchase. Many users could favourite many stocks, so we built a join table to enable this kind of data relationship.

  ```py
  users_stocks_join = db.Table(
    	"favourites",
    	db.Column("user_id", db.Integer, db.ForeignKey("users.id"), primary_key=True),
    	db.Column("stock_id", db.Integer, db.ForeignKey("stocks.id"), primary_key=True),
  )
  ```

**Controllers**

Making the controllers was pretty easy. We made them for users to register, login and trade, as well as those that allowed us to find and favourite specific assets. We enabled some basic authorizations and permissions for security purposes. Because we were working with Python, we used Marshmallow to serialize and deserialize as needed.

The controller that adjusted the wallet of each user after a transaction:

  ```py
@router.route("/<int:user_id>/wallet", methods=["PUT"])
@secure_route
def update_wallet(user_id):

    existing_user = User.query.get(user_id)
    qty_dictionary = request.json

    if not existing_user:
        return {"message": "No user found"}
    if existing_user != g.current_user:
        return {"errors": "Unauthorized"}, 401

    try:
        user = user_schema.load(
            qty_dictionary,
            instance=existing_user,
            partial=True,
        )

    except ValidationError as e:
        return {"errors": e.messages, "messages": "Something went wrong"}

    user.save()

    return user_schema.jsonify(user), 201
  ```

### Frontend

**Structure**

Frontend was structured in our App.js file using React Router:

  ```js
 const App = () => (
  <BrowserRouter>
    <Sidebar />
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/register" component={Register} />
      <Route exact path="/login" component={Login} />
      <Route exact path="/portfolio" component={Portfolio} />
      <Route exact path="/research" component={Research} />
      <Route exact path="/trading" component={Trading} />
      <Route exact path="/asset/:assetId" component={Asset} />
      <Route exact path="/about" component={About} />
    </Switch>
    <Footer />
  </BrowserRouter>
)

export default App
  ```

Having all the components and all the paths visible on one page really helped in terms of dividing the workload between the three of us.

**Homepage**

Homepage was built using Semantic React UI layout template. Simple but effective navbar, clean design and catchy phrases allow the user to focus on the key elements, and most important - action. Creating Homepage with the template provided was challenging in terms of learning how to use Semantic React UI from scratch, converting class components to functional components and tailoring the applied inline styling. From this perspective, the template served more as an idea of how the homepage might look than it made the process of creating the page easier.

**Register and Login Page**

Register and login pages were also made using Semantic React UI layout templates as an example. Clean design, same color scheme and some basic error handling integrated into the UI are the main features of these pages.

Here we used local storage so that, when a user is logged in, a token generated on the backend would be passed through and saved in local storage. The token would be used to extract the user ID and this would be used to fetch the user information from the backend. This information would then 'follow' the user around as they travelled through the site. When they logged out, the local storage would be emptied and the token would be discarded. 

The code on the login where the token would be recorded in local storage:

  ```js
 if (localStorage) {
        localStorage.setItem('token', data.token)
        const token = data.token
        const payloadAsString = atob(token.split('.')[1])
        const payloadAsObject = JSON.parse(payloadAsString)
        const userID = payloadAsObject.sub
 }
 history.push('/')
  ```

**Research and Asset Page**

When the user creates an account, a good starting point is to see what is available before making a trade. That was a basic idea for a simple research page with some financial news, top-line market information and a search bar where users could search for assets. If they search for e.g. AAPL (Apple Inc), some basic information appear. By clicking 'Learn More', users can find a lot more information available on the asset page. They could also 'Favourite' an asset, or if it was already favourited - unfavourite it.

<img align = 'center' src='https://i.imgur.com/vqtPvdk.png' >

*An example of a stock.*

<img align = 'center' src='https://i.imgur.com/vlqMktc.png' >

*And a crypto.*

As we discovered that on the backend some of the assets had the same ticker symbols - 'ETH' referred to Ethereum but also to Ethan Allen Interiors Inc, this meant we needed different controllers to search for cryptos and stocks. This was not so bad as we already had made a distinction between cryptos and stocks on our stock model. However, the third-party APIs we were pulling current data from were all organized differently and all tended to specialize in either crypto or stocks. As we were using the most basic tier of membership for these APIs (the free one), we had to scout around looking for which API we could use to get different data points.

At the highest level, when a user wanted to know about crypto we would show them a totally different set of data pulled from a totally different set of APIs, versus if they had searched for stocks.

This was a challenge that replicated itself across almost every page. It was mostly invisible for users. For us, it was probably the most significant coding problem we wrestled with over the course of this project.

**Trading Page**

The idea for this page was to provide a real-life trading platform experience. It was supposed to contain five main functionalities:

1. Search for assets to buy/sell
2. Allow the user to input quantities to buy/sell
3. Test whether this trade was permitted (e.g. that they had sufficient funds to make a purchase)
4. If the trade was permitted, then POST a trade model to the backend
5. And PUT the user model to adjust the amount in the user's wallet accordingly.

<img align = 'center' src='https://i.imgur.com/WzMW0xW.png' >

Piece of code that adjusts the user's wallet was built on the frontend. It makes a PUT request based on the trade and generates a revised wallet amount.

<img align = 'center' src='https://i.imgur.com/pQMqdRP.png' >

**Portfolio Page**

Some of the most complex code was on the Portfolio page. This was because on this page we had to compile all the transactions associated with a specific user, divide them up by asset, combine them to discover the current holding, and then do a fetch request to a third-party API to discover the current value of that holding. This information then had to be displayed on programmatically built tables on the page. Once again, we encountered the familiar problem of the crypto/stock divide, as we had to calculate the crypto holding values and the stock holding values separately.

Needless to say, we came across a lot of bugs in this process, but in the end we had the page looking pretty good.

<img align = 'center' src='https://i.imgur.com/o0wtHFm.png' >

**Styling**

Using Semantic React UI had its benefits and drawbacks. It made it easier to standardize the look of the website, whilst making the layout of each page slightly harder to plan. Semantic also threw up a load of errors when we were setting up the client files initially and when we were finally deploying to Heroku. But it was all a good experience in the end.

We used teal, black and white as the dominant colours, and picked out Poppins from Google Fonts as the primary font. We pulled some stock images from FreePik.com and some of our own screenshots hosted on Imgur, to add some visual elements to the home and about page.

## Conclusion

**Wins**

- We wanted to build a full-stack trading platform which hosts stocks and cryptocurrencies, and interacts with a clean, intuitively designed frontend - and we did!

- We worked well as a team. With some early wins, we got into a good routine. We were able to divide up the work in a way which made sense, but gave everyone exposure to every part of the code base. Communication was good throughout the project, and we were always there to debug each other's code when we ran into problems.

**Challenges**

- Our project was a lot more ambitious than we first realized. We had decided to do stocks and crypto, which effectively doubled the work on each component. Whilst our backend treated these as generalized assets available for purchase, on the frontend we were interacting with third-party APIs (8 in total). A large part of this project was ensuring that the website felt the same to users whether they were browsing for stocks or crypto. Therefore, every page had been carefully coded as we had to talk to totally different APIs depending on the asset class.

- Relying on so many different third-party APIs created problems in development, as well as with deployment, due to keys expiring or usage limits being reached.

- We challenged ourselves by using a CSS framework none of us had used before - Semantic React UI. It was a very good learning experience.

**Potential future features**

- Our original plan encompassed more data visualizations as stretch goals. With deadlines in place, we had to limit ourselves to a simple line chart on the asset page.

- We wanted to add more content to the research page and make it more responsive and better styled.

- As we made a trade-off between having a relatively simple backend in order to create a more ambitious frontend, refactoring is certainly something we would have dealt with in different circumstances.

**Bugs** 

- Semantic React UI search element on the research page (Search By Symbol), has a built-in 'No results found.' message.

**Lessons learned**

- A good plan and good communication are the key to the success of the project.

- It was important to decide in advance what features should be stretch goals, and then to ensure that they have little or no implications on the functionality of all the other features.

- Overall, this project was a really good showcase of our acquired knowledge and skills.

## Credit

[Crypto Market Cap & Pricing Data](https://nomics.com/) provided by Nomics.