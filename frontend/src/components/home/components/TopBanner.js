import React from 'react'

const TopBanner = () => {
  return (
    <>
      <div id="top" className="min-h-screen pt-16 pb-8 flex max-md:flex-col-reverse justify-center items-center bg-white">
        <div className="w-1/2 max-md:w-full pl-8 pr-8 max-lg:pl-4 max-lg:pr-3 max-md:px-4 max-md:pt-4 flex justify-end max-md:justify-center">
          <div className="flex flex-col items-start max-md:items-center text-start max-md:text-center">
            <div className="text-sm font-bold tracking-[0.3em] text-gray-500 uppercase">
              Portfolio
            </div>
            <h1 className="mt-2 text-6xl max-xl:text-5xl max-sm:text-4xl font-bold">
              篠原 諒成
            </h1>
            <div className="mt-1 text-2xl max-xl:text-xl max-sm:text-lg font-bold text-gray-600">
              Shinohara Ryosei
            </div>
            <div className="mt-6 max-md:mt-4 text-xl max-xl:text-lg max-sm:text-base font-medium leading-relaxed">
              <span>情報技術を活用した</span><span>社会課題の解決を目指す、</span><span>大学2年生</span>
            </div>
            <div className="mt-8 max-md:mt-6 flex flex-wrap max-md:justify-center gap-3">
              <a
                href="#works"
                className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-3 font-bold text-white hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-colors"
              >
                Works を見る
              </a>
              <a
                href="https://github.com/Ryosei1009"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border-2 border-gray-900 px-6 py-3 font-bold text-gray-900 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-colors"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 mr-2 fill-current"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.463 2 11.97c0 4.404 2.865 8.14 6.839 9.458.5.092.682-.216.682-.48 0-.236-.008-.864-.013-1.695-2.782.602-3.369-1.337-3.369-1.337-.454-1.151-1.11-1.458-1.11-1.458-.908-.618.069-.606.069-.606 1.003.07 1.531 1.027 1.531 1.027.892 1.524 2.341 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.251-4.555-1.107-4.555-4.927 0-1.088.39-1.979 1.029-2.675-.103-.252-.446-1.266.098-2.638 0 0 .84-.268 2.75 1.022A9.607 9.607 0 0 1 12 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.386.1 2.638.64.696 1.028 1.587 1.028 2.675 0 3.83-2.339 4.673-4.566 4.92.359.307.678.915.678 1.846 0 1.332-.012 2.407-.012 2.734 0 .267.18.577.688.48 3.97-1.32 6.833-5.054 6.833-9.458C22 6.463 17.522 2 12 2Z"></path></svg>
                GitHub
                <span className="sr-only">（新しいタブで開きます）</span>
              </a>
            </div>
          </div>
        </div>
        <div className="w-1/2 pr-16 max-md:w-3/4 max-md:-mr-6 max-lg:pr-4">
          <img className="w-full h-auto" src="/images/home/mv.png" width="750" height="692" alt="海辺の岩場に座って海を眺める写真" />
        </div>
      </div>
    </>
  )
}

export default TopBanner
