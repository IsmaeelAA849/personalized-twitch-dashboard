// Main entry point of your app
import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import StreamerGrid from '../components/StreamerGrid'


const Home = () => {

  const [favoriteChannels, setFavoriteChannels] = useState([])


  const addStreamChannel = async event => {
    event.preventDefault()
    const { value } = event.target.elements.name
    if (value) {
      console.log('Input: ', value)

      const path = `https://${window.location.hostname}`
      const response = await fetch(`${path}/api/twitch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: value })
      })

      const json = await response.json()
      console.log("From the server: ", json.data)

      setFavoriteChannels(prevState => [...prevState, json.data])

      await setChannel(value)

      event.target.elements.name.value = ""

    }
  }

  const fetchChannels = async () => {
    try {

      const path = `https://${window.location.hostname}`
      const response = await fetch(`${path}/api/database`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'GET_CHANNELS',
          key: 'CHANNELS'
        })
      })

      if (response.status === 404) {
        console.warn('Channels key not found.')

        return
      }
      const json = await response.json()
      const channelData = []
      if (json.data) {
        const channelNames = json.data.split(',')
        console.log('CHANNEL NAMES: ', channelNames)


        for await (const channelName of channelNames) {
          console.log("Getting Twitch Data for: ", channelName)
          const channelResp = await fetch(`${path}/api/twitch`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              data: channelName
            })
          })

          const json = await channelResp.json()
          if (json.data) {
            channelData.push(json.data)
            console.log(channelData)
          }
        }

      }
      setFavoriteChannels(channelData)

    }
    catch (error) {
      console.warn(error.message)

    }
  }

  const setChannel = async value => {
    try {
      const currentStreamers = favoriteChannels.map(channel => channel.display_name.toLowerCase())

      const streamersList = [...currentStreamers, value].join(",")

      const path = `https://${window.location.hostname}`

      const response = fetch(`${path}/api/database`, {
        method: 'POST',
        body: JSON.stringify({
          key: 'CHANNELS',
          value: streamersList
        })
      })
      if (response.status === 200) {
        console.log(`Set ${streamersList} in DB`)
      }
    }
    catch (error) {
      console.warn(error.message)
    }
  }

  const renderForm = () => (
    <div className={styles.formContainer}>
      <form onSubmit={addStreamChannel}>
        <input id="name" placeholder="Twitch Channel Name" type="text" required />
        <button type="submit">Add Streamer</button>
      </form>
    </div>
  )

  useEffect(() => {
    console.log('CHECKING DB...')
    fetchChannels()
  }, []
  )

  return (
    <div className={styles.container}>
      <Head>
        <title>🎥 Personal Twitch Dashboard</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className={styles.inputContainer}>
        {renderForm()}

        <StreamerGrid channels={favoriteChannels} setChannels={setFavoriteChannels} />
      </div>
    </div>
  )
}

export default Home