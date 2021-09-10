import React, { useEffect } from 'react'
import styles from '../../styles/StreamerGrid.module.css'
import Image from 'next/image'
const StreamerGrid = ({ channels, setChannels }) => {

  const setDBChannels = async channels => {
    try {
      const path = `https://${window.location.hostname}`
      const response = await fetch(`${path}/api/database`,{
        method: 'POST',
        body: JSON.stringify({
          key: 'CHANNELS',
          value: channels
        })
      })
      if(response.status===200){
        console.log(`Set ${channels} in DB.`)
      }
    }
    catch (error){
      console.warn(error.message)
    }
  }
  const removeChannelAction = channelId => async () => {
    console.log('Removing channel...')
    const filteredChannels = channels.filter(channel => channel.id !== channelId)

    setChannels(filteredChannels)
    const joinedChannels = filteredChannels.map(channel => channel.display_name.toLowerCase()).join(',')

    await setDBChannels(joinedChannels)

  }

  const renderNoItems = () => (
    <div className={styles.gridNoItems}>
      <p>Are we doing anything?</p>
    </div>
  )
  const renderGridItem = channel => (
    <div key={channel.id} className={styles.gridItem}>
      <button onClick={removeChannelAction(channel.id)}>X</button>
      <Image layout="fill" src={channel.thumbnail_url} />
      <div className={styles.gridItemContent}>
        <p>{channel.display_name}</p>
        {channel.is_live && <p>🔴 Live Now!</p>}
        {!channel.is_live && <p>⚫️ Offline</p>}
      </div>
    </div>
  )


  useEffect(() => {
    console.log('CHANNELS: ', channels)
  }, [channels]
  )
  return (
    <div className={styles.container}>
      <h2> Ismaeel is Awesome</h2>
      {channels.length === 0 && renderNoItems()}
      <div className={styles.gridContainer}>

        {channels.length > 0 && channels.map(renderGridItem)}


      </div>



    </div>

  )
}

export default StreamerGrid