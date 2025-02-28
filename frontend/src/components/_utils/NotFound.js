import React from 'react'

const NotFound = () => {
    return (
        <div className="flex justify-center items-center flex-col pt-36 pb-24">
            <span className="text-9xl max-md:text-7xl font-bold text-red-500">404</span>
            <span className="text-9xl max-md:text-7xl font-bold text-red-500 mb-10">NotFound</span>
            <div className="text-3xl max-md:text-xl font-bold">
                存在しないページです！
            </div>
            <div className="text-3xl max-md:text-xl font-bold">
                The page does not exist!
            </div>
        </div>
    )
}

export default NotFound