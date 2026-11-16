import React, { useEffect } from 'react'

const NotFound = () => {
    // このページが出ている間だけ noindex を付ける（離れたら外す）
    useEffect(() => {
        const meta = document.createElement('meta')
        meta.name = 'robots'
        meta.content = 'noindex'
        document.head.appendChild(meta)
        const previousTitle = document.title
        document.title = '404 Not Found - 篠原 諒成'
        return () => {
            meta.remove()
            document.title = previousTitle
        }
    }, [])

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