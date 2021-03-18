import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Button, Grid, Image, Table, Container } from 'semantic-ui-react'
import { XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries, VerticalGridLines } from 'react-vis'

export default function Asset({ location }) {
  const [financials, updateFinancials] = useState([])
  const [cryptoDescription, updatecryptoDescription] = useState([])
  const [cryptoMetrics, updateCryptoMetrics] = useState([])
  const [cryptoBackground, updatecryptoBackground] = useState([])
  const [cryptoTechnology, updatecryptoTechnology] = useState([])
  const [ratios, updateRatios] = useState([])
  const [showFinancials, updateShowFinancials] = useState(false)
  const [showCrypto, updateShowCrypto] = useState(false)
  const [graphData, updateGraphData] = useState([])
  const [xyData, updateXYData] = useState([])
  const [xyDataParam, updateXYDataParam] = useState('')
  const [mktCap, updateMktCap] = useState('')
  const asset = location.state.assetState
  const assetName = location.state.nameState
  const quote = location.state.quoteState
  const assetType = location.state.assetType
  const image = location.state.img

  useEffect(() => {
    async function getMktCap() {
      const { data } = await axios.get(`https://financialmodelingprep.com/api/v3/market-capitalization/${asset}?apikey=12e0314bcbd996367eadfa3d7ed933e9`)
      updateMktCap(data[0].marketCap)
    }
    getMktCap()
  }, [])

  useEffect(() => {
    async function getCryptoMetrics() {
      const { data } = await axios.get(`https://data.messari.io/api/v1/assets/${asset}/metrics`)
      const blockchain = Object.entries(data.data.blockchain_stats_24_hours)
      const metrics = Object.entries(data.data.roi_data)
      const combined = [...blockchain, ...metrics]
      updateCryptoMetrics(combined)
    }
    getCryptoMetrics()
  }, [])

  if (assetType === 'crypto') {
    useEffect(() => {
      async function getCryptoDescription() {
        const { data } = await axios.get(`https://data.messari.io/api/v1/assets/${assetName}/profile`)
        updatecryptoDescription(data.data.overview)
        updatecryptoBackground(data.data.background)
        updatecryptoTechnology(data.data.technology)
      }
      getCryptoDescription()
    }, [])
  }

  useEffect(() => {
    async function tableData() {
      const { data } = await axios.get(`https://finnhub.io/api/v1/stock/metric?symbol=${asset}&metric=all&token=c18hab748v6oak5h78g0`)
      updateFinancials(Object.entries(data.metric))
    }
    tableData()
  }, [])

  useEffect(() => {
    async function ratioData() {
      const { data } = await axios.get(`https://financialmodelingprep.com/api/v3/ratios-ttm/${asset}?apikey=12e0314bcbd996367eadfa3d7ed933e9`)
      updateRatios(Object.entries(data[0]))
    }
    ratioData()
  }, [])

  useEffect(() => {

    async function graphFunc() {
      const { data } = await axios.get(`https://api.marketstack.com/v1/eod?access_key=b423407c1ef7cdb1569a2f04fc263513&symbols=${asset}`)
      updateGraphData(data.data.slice(0, 90))
    }
    async function cryptoGraphFunc() {
      const { data } = await axios.get(`https://data.messari.io/api/v1/assets/${asset}/metrics/price/time-series?start=2020-12-01&interval=1d`)
      const cryptoTimeSeries = data.data.values.reverse().slice(0, 90)
      updateGraphData(cryptoTimeSeries)

    }
    if (assetType !== 'crypto') {
      graphFunc()
    } else {
      cryptoGraphFunc()
    }

  }, [])

  useEffect(() => {
    async function graphFunc1() {
      const dataPointArray = []
      for (let index = 0; index < graphData.length; index++) {
        const dataPoint = {
          x: Number(`${index}`), y: Number(`${graphData[index].close}`)
        }
        dataPointArray.unshift(dataPoint)
      }
      updateXYData(dataPointArray)
      updateXYDataParam(dataPointArray.length)
    }
    async function cryptoGraphFunc1() {
      const dataPointArray = []
      for (let index = 0; index < graphData.length; index++) {
        const dataPoint = {
          x: Number(`${index}`), y: Number(`${graphData[index][4]}`)
        }
        dataPointArray.unshift(dataPoint)
      }
      updateXYData(dataPointArray)
      updateXYDataParam(dataPointArray.length)
    }
    if (assetType !== 'crypto') {
      graphFunc1()
    } else {
      cryptoGraphFunc1()
    }
  }, [graphData])

  function revealFinancials() {
    if (showFinancials) {
      updateShowFinancials(false)
    } else {
      updateShowFinancials(true)
    }
  }

  function revealMore() {
    if (showCrypto) {
      updateShowCrypto(false)
    } else {
      updateShowCrypto(true)
    }
  }

  if (!graphData) {
    return null
  }
  if (!financials) {
    return null
  }
  if (!cryptoMetrics) {
    return null
  }

  const hidden = { overflow: 'auto', maxHeight: '500px', display: 'none' }
  const revealed = { overflow: 'auto', maxHeight: 300, display: 'inline-block' }

  return <div>
    <div textAlign='center' verticalAlign='middle' style={{ padding: '2em 1em' }}>
      <Image src={assetType !== 'crypto' ? `//logo.clearbit.com/${image}` : image} size={assetType !== 'crypto' ? 'large' : 'tiny'} wrapped />
      <span><h1 style={{  fontFamily: 'Poppins'  }} textAlign='center' verticalAlign='middle'>{assetName}</h1>
        <h4 style={{ padding: '0.2em 0.05em', fontFamily: 'Poppins' }}>Share Price (USD): {Number(quote).toFixed(2)}</h4>
        <h4 style={{ padding: '0.2em 0.05em', fontFamily: 'Poppins' }}>Market Capitalization (USD) {assetType === 'crypto' ? location.state.mktCap : Number(mktCap).toFixed(2)}</h4>
      </span>
    </div>

    <Grid style={{ padding: '2em 1em' }} >
      <Grid.Row columns={2} style={{ padding: '2em 1em' }} >
        <Grid.Column color='teal'>
          <XYPlot height={500} width={500} xDomain={[Number(`${xyDataParam}`), 0]} color='teal'>
            <VerticalGridLines />
            <HorizontalGridLines />
            <XAxis title='90 Day Performance' />
            <YAxis title='Asset Price (USD)' style={{ fontSize: '10px' }} />
            <LineSeries color="yellow" data={xyData} />
          </XYPlot>
        </Grid.Column>

        {assetType !== 'crypto' && <Grid.Column >
          Key Ratios & Multiples
          <Container style={revealed} >
            <Grid >
              <Grid.Row style={{ padding: '2em 1em' }} >
                {ratios.map((data, index) => {
                  if (data[1] !== null && data[1] !== 0)
                    return <><Grid.Column key={index} width={3} >
                      < Table celled >
                        <Table.Header >
                          <Table.Row >
                            <Table.HeaderCell style={{ fontSize: '12px' }}>{data[0]} </Table.HeaderCell>
                          </Table.Row>
                        </Table.Header >
                        <Table.Body >
                          <Table.Row >
                            <Table.Cell >
                              {Number(data[1]).toFixed(2)}
                            </Table.Cell>
                          </Table.Row>
                        </Table.Body>
                      </Table>
                    </Grid.Column>
                    </>
                })}
              </Grid.Row>
            </Grid>
          </Container>
        </Grid.Column>}

        {assetType === 'crypto' && <Grid.Column>
          <h4>Description</h4>
          <Container style={revealed}>{cryptoDescription}</Container>
          <h4>Metrics</h4>
          <Container style={revealed} >
            <Grid >
              <Grid.Row style={{ padding: '2em 1em' }} >
                {cryptoMetrics.map((data, index) => {
                  if (data[1] !== null && data[1] !== 0)
                    return <div key={index}>
                      <Grid.Column key={index} width={3} >
                        < Table celled >
                          <Table.Header >
                            <Table.Row >
                              <Table.HeaderCell >{data[0]}</Table.HeaderCell>
                            </Table.Row>
                          </Table.Header >
                          <Table.Body >
                            <Table.Row >
                              <Table.Cell >
                                {data[1]}
                              </Table.Cell>
                            </Table.Row>
                          </Table.Body>
                        </Table>
                      </Grid.Column>
                    </div>
                })}
              </Grid.Row>
            </Grid>
          </Container>
        </Grid.Column>}
      </Grid.Row>
    </Grid>
    <div>
      <Link to={'/trading'}>
        <Button color='purple' style={{ margin: '0.5em 0.5em', textAlign: 'right' }} content='Trade' />
      </Link>
      <Link to={'/research'}>
        <Button color='teal' content='Previous Page' />
      </Link>
    </div>
    {assetType !== 'crypto' && <div>
      <Button  color='yellow' onClick={revealFinancials} content="See Financials" />
    </div>}
    {assetType === 'crypto' && <div>
      <Button animated color='purple' onClick={revealMore}>
        <Button.Content visible>Learn More</Button.Content>
        <Button.Content hidden>
          Click Here
        </Button.Content>
      </Button>
    </div>}
    {assetType === 'crypto' && <Grid.Column style={showCrypto ? revealed : hidden}>
      <h4>Background</h4>
      <Container >{cryptoBackground}</Container>
      <h4>Technology</h4>
      <Container >{cryptoTechnology}</Container>
    </Grid.Column>}
    <Container style={showFinancials ? revealed : hidden}>
      <Grid >
        <Grid.Row >
          {financials.map((data, index) => {
            if (data[1] !== null && data[1] !== 0)
              return <><Grid.Column key={index} width={3} >
                < Table celled >
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>{data[0]}</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell>
                        {data[1]}
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table>
              </Grid.Column>
              </>
          })}
        </Grid.Row>
      </Grid>
    </Container>
  </div >
}