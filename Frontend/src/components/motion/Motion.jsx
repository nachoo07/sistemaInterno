import React from 'react'
import '../motion/motion.css'
import VerticalMenu from '../verticalMenu/VerticalMenu'
import Icome from '../motion/income/Icome'

const Motion = () => {
  return (
    <>
      <div className='main-container'>
        <div className='vertical-menu'>
          <VerticalMenu />
        </div>
        <div className='content-container'>
          <Icome />
        </div>
      </div>
    </>
  )
}

export default Motion