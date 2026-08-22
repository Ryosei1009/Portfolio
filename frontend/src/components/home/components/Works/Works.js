import React, { useEffect, useRef, useState } from 'react'
import EachWork from './EachWork';
import CreateWorkModal from '../CreateWork/CreateWorkModal';
import axios from 'axios';

const Works = ({ isAuth }) => {
    const [selectedWork, setSelectedWork] = useState(0);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [createWorkModalIsOpen, setCreateWorkModalIsOpen] = useState(false);
    const [works, setWorks] = useState()
    const categories = ['学外活動', '大学', '高校']

    useEffect(() => {
        async function fetchWorks() {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_DOMAIN}/works/get`);
                const data = await response.json();
                setWorks(data);
                console.log(data)
            } catch (error) {
                console.error('Error fetching new item list:', error);
            }
        }
        fetchWorks();
    }, [])

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
                            {isAuth && <div className="text-xl font-normal text-blue-600 hover:underline cursor-pointer" onClick={() => setCreateWorkModalIsOpen(true)}>新規作成</div>}
                        </div>
                    </div>
                </div>
                {categories.map((category) => (
                    <>
                        <div className="w-full mt-2 flex justify-end">
                            <div className="mr-4 text-xl font-bold bg-blue-500 px-4 py-1 rounded-lg text-white">
                                {category}
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center items-center gap-6 mx-16 mt-8 max-xl:mx-8 max-lg:mx-4 pb-8 text-black font-bold">
                            {works && works.filter((item) => item.category === category).slice().map((item) => (
                                <div className="max-xl:w-72 w-1/4 relative" key={item.id}>
                                    <img
                                        src={`${process.env.REACT_APP_API_DOMAIN}/images/works/${item.id}/1_mid.png`} alt={item.id}
                                        onClick={() => handleModal(item)}
                                        // onError={(event) => { event.target.src = `/images/works/error.png` }}
                                        className="hover:scale-110 transition-all cursor-pointer"
                                        style={{ "boxShadow": "0px 0px 6px 1px rgba(0, 0, 0, 0.45)" }}
                                        loading="lazy"
                                    />
                                    <div className="max-md:text-lg text-xl flex flex-col justify-center items-center my-3">
                                        {isAuth ? (
                                            <WorkNameEditor item={item} />
                                        ) : (
                                            <div dangerouslySetInnerHTML={{ __html: item.name }} />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ))}
            </div>
            <EachWork modalIsOpen={modalIsOpen} setModalIsOpen={setModalIsOpen} selectedWork={selectedWork} setSelectedWork={setSelectedWork} works={works} isAuth={isAuth} setWorks={setWorks} />
            <CreateWorkModal createWorkModalIsOpen={createWorkModalIsOpen} setCreateWorkModalIsOpen={setCreateWorkModalIsOpen} />
        </>
    )
}

export default Works

const WorkNameEditor = ({ item }) => {
    const [isEditing, setIsEditing] = useState(false)
    const nameRef = useRef(null)
    const [formData, setFormData] = useState({
        id: item.id,
        name: item.name,
    })

    const handleChange = (event) => {
        setFormData(prev => ({ ...prev, [event.target.name]: event.target.value }));
    };

    useEffect(() => {
        const updateName = async () => {
            try {
                await axios.post(`${process.env.REACT_APP_API_DOMAIN}/works/update/name`, formData, {
                    headers: {
                        'Authorization': localStorage.getItem('token')
                    }
                });
            } catch (error) {
                console.error('Error uploading data:', error);
            }
        };
        if (Object.keys(formData).length > 0) {
            updateName();
        }
    }, [formData]);

    return (
        <>
            <input
                name="name"
                type="text"
                onBlur={() => setIsEditing(false)}
                onChange={(event) => handleChange(event)}
                value={formData.name}
                className={`${isEditing ? "block" : "hidden"} w-full`}
                ref={nameRef}
            />
            <div
                dangerouslySetInnerHTML={{ __html: formData.name }}
                className={`${isEditing ? "hidden" : "block"}`}
                onClick={() => {
                    setIsEditing(true)
                    setTimeout(() => {
                        nameRef.current.focus()
                        nameRef.current.setSelectionRange(0, 0);
                    }, 1)
                }}
            />
        </>

    )
}