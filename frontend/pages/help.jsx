import Head from 'next/head'
import React, { useState } from 'react'
import Link from 'next/link'

export default function Help() {
  return (
    <>
      <Head>
        <title>Lightning DEX - Help</title>
        <meta name="description" content="Help page" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <nav>
          <Link href="/">Swap</Link>&nbsp;
          <Link href="/pool">Pool</Link>&nbsp;
          <Link href="/help">Help</Link>
        </nav>
      </main>

      <h1>Help</h1>

      <p><i>How can I open a channel to your node?</i></p>
      <p>Connect to us at: </p>
      <p>02572fcd9ca25472108ff62b975dff47f5625e57abcf0f354065c9586db8dbd632@34.214.120.115:9735</p>

      <hr/>

      <p><i>Can I receive a payment without opening a channel with you?</i></p>
      <p>Not at the moment, but you will be able to request a channel open soon</p>

      <hr/>

      <p><i>Where can I get more help?</i></p>
      <p><a href="https://discord.gg/zigzag">Discord</a></p>




    </>
  )
}

