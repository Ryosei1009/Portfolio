import React, { useEffect, useState } from 'react'
import { EnvelopeIcon } from '@heroicons/react/24/solid'
import IconModal from './IconModal'
import { markedText } from '../../../utils/TextUtil'
import EditAboutMe from './EditAboutMe'

const AboutMe = ({ isAuth }) => {
    const [iconOpen, setIconOpen] = useState(false)
    const [aboutMe, setAboutMe] = useState()


    useEffect(() => {
        async function fetchAboutMe() {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_DOMAIN}/aboutme/get`);
                const data = await response.json();
                setAboutMe(data);
                console.log(data)
            } catch (error) {
                console.error('Error fetching new item list:', error);
            }
        }
        fetchAboutMe();
    }, [])

    return (
        <>
            <div id="aboutme" className="flex justify-center my-24">
                <div className="text-black max-w-5xl mx-16 max-xl:mx-8 max-lg:mx-4 flex flex-col justify-center">
                    <div className="text-5xl max-sm:text-4xl font-bold mb-4 max-md:mb-0">
                        About Me<span className="ml-4 text-xl">自己紹介</span>
                    </div>
                    {aboutMe && (
                        isAuth ? (
                            <EditAboutMe aboutMe={aboutMe} setIconOpen={setIconOpen} />
                        ) : (
                            <>
                                <div className="flex items-center justify-center my-4 max-md:my-2">
                                    <img loading="lazy" onClick={() => setIconOpen(true)} src={aboutMe[0].image} alt="" className="w-1/6 max-md:w-1/5 max-sm:w-1/4 border-white border-2 rounded-full cursor-pointer hover:opacity-80" />
                                    <div className="ml-8 w-2/3 max-sm:w-3/4">
                                        <div className="ml-2 font-bold text-4xl max-md:text-3xl max-sm:text-2xl">{aboutMe[0].name}</div>
                                        <div className="font-bold text-2xl max-md:text-xl max-sm:text-lg">{aboutMe[0].sub_name}</div>
                                    </div>
                                </div>
                                <div className="flex max-md:flex-col my-4 items-center">
                                    <div className="w-5/6 max-lg:w-4/6 mr-8 max-md:mr-0 max-md:w-full max-md:text-sm">
                                        <div className="flex justify-between items-start mb-4 max-sm:flex-col">
                                            <div className="w-3/4 max-sm:w-full max-sm:mb-2">
                                                <h4>経歴</h4>
                                                <div className="ml-2" dangerouslySetInnerHTML={markedText(aboutMe[0].history)} />
                                            </div>
                                            <div className="w-1/4 max-sm:w-full">
                                                <h4>スキル</h4>
                                                <div className="ml-2" dangerouslySetInnerHTML={markedText(aboutMe[0].skill)} />
                                            </div>
                                        </div>
                                        <div dangerouslySetInnerHTML={markedText(aboutMe[0].introduction)} />
                                    </div>
                                    <div className="w-1/6 max-md:w-full max-md:mt-4 max-md:flex max-md:flex-col max-md:items-center text-lg">
                                        <a className="flex hover:opacity-80 w-fit max-md:text-sm" href={`mailto:${aboutMe[0].mail}`} target="_blank" rel="noopener noreferrer">
                                            <EnvelopeIcon className="w-6 h-6 max-md:w-5 max-md:h-5 mr-1"></EnvelopeIcon>{aboutMe[0].mail}
                                        </a>
                                        <div className="max-md:flex max-md:justify-evenly max-md:gap-4 max-md:mt-1">
                                            <a className="flex hover:opacity-80 w-fit max-md:text-sm" href={aboutMe[0].github_url} target="_blank" rel="noopener noreferrer">
                                                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 max-md:w-5 max-md:h-5 mr-1 fill-black"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.463 2 11.97c0 4.404 2.865 8.14 6.839 9.458.5.092.682-.216.682-.48 0-.236-.008-.864-.013-1.695-2.782.602-3.369-1.337-3.369-1.337-.454-1.151-1.11-1.458-1.11-1.458-.908-.618.069-.606.069-.606 1.003.07 1.531 1.027 1.531 1.027.892 1.524 2.341 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.251-4.555-1.107-4.555-4.927 0-1.088.39-1.979 1.029-2.675-.103-.252-.446-1.266.098-2.638 0 0 .84-.268 2.75 1.022A9.607 9.607 0 0 1 12 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.386.1 2.638.64.696 1.028 1.587 1.028 2.675 0 3.83-2.339 4.673-4.566 4.92.359.307.678.915.678 1.846 0 1.332-.012 2.407-.012 2.734 0 .267.18.577.688.48 3.97-1.32 6.833-5.054 6.833-9.458C22 6.463 17.522 2 12 2Z"></path></svg>
                                                {aboutMe[0].github_name}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )
                    )}
                </div >
                <IconModal iconOpen={iconOpen} setIconOpen={setIconOpen} />
            </div >
        </>
    )
}

export default AboutMe