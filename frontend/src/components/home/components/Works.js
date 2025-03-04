import React, { useEffect, useState } from 'react'
import EachWork from './works/EachWork';
import CreateWorkModal from './CreateWorkModal';
import { works } from './db/Works';

const Works = () => {
    const [selectedWork, setSelectedWork] = useState(0);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [createWorkModalIsOpen, setCreateWorkModalIsOpen] = useState(false);
    // const [works, setWorks] = useState()

    // useEffect(() => {
    //     async function fetchWorks() {
    //         try {
    //             const response = await fetch(`${process.env.REACT_APP_API_DOMAIN}/works/get`);
    //             const data = await response.json();
    //             setWorks(data);
    //             console.log(data)
    //         } catch (error) {
    //             console.error('Error fetching new item list:', error);
    //         }
    //     }
    //     fetchWorks();
    // }, [])

    const handleModal = (work) => {
        setSelectedWork(work);
        setModalIsOpen(true)
    }

    return (
        <>
            <div id="works">
                <div className="flex justify-center">
                    <div className="max-w-5xl mx-16 max-xl:mx-8 max-lg:mx-4 w-full">
                        <div className="text-5xl max-sm:text-4xl font-bold mb-4 max-md:mb-0 flex justify-between items-end">
                            <div>Works<span className="ml-4 text-xl">これまでしてきたこと</span></div>
                            {/* <div className="text-xl font-normal text-blue-600 hover:underline cursor-pointer" onClick={() => setCreateWorkModalIsOpen(true)}>新規作成</div> */}
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-6 mx-16 mt-8 max-xl:mx-8 max-lg:mx-4 pb-8 text-black font-bold">
                    {works && works.slice().map((item) => (
                        <div className="max-xl:w-72 w-1/4 relative" key={item.id}>
                            <img
                                src={`${process.env.REACT_APP_IMAGE_DOMAIN}/images/works/${item.id}/1.png`} alt={item.id}
                                onClick={() => handleModal(item)}
                                onError={(e) => { e.target.src = `/images/works/error.png` }}
                                className="hover:scale-110 transition-all cursor-pointer absolute"
                                style={{ "boxShadow": "0px 0px 6px 1px rgba(0, 0, 0, 0.45)" }}
                                loading="lazy"
                            />
                            <img
                                src={`/images/works/error.png`} alt={item.id}
                                onClick={() => handleModal(item)}
                                className="hover:scale-110 transition-all cursor-pointer -z-50"
                                loading="lazy"
                            />
                            <div className="text-xl flex flex-col justify-center items-center my-3">
                                <div dangerouslySetInnerHTML={{ __html: item.name }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <EachWork modalIsOpen={modalIsOpen} setModalIsOpen={setModalIsOpen} selectedWork={selectedWork} setSelectedWork={setSelectedWork} works={works} />
            <CreateWorkModal createWorkModalIsOpen={createWorkModalIsOpen} setCreateWorkModalIsOpen={setCreateWorkModalIsOpen} />
        </>
    )
}

export default Works