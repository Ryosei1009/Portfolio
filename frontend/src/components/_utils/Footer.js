import React from 'react'

const Footer = () => {
  return (
    <>
        <div className="bg-black bg-opacity-10 py-8 flex items-center justify-center text-lg">
            ©{new Date().getFullYear()} Ryosei Shinohara
        </div>
    </>
  )
}

export default Footer