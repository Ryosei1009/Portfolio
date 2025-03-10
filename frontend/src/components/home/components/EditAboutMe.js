import { EnvelopeIcon } from '@heroicons/react/24/solid'
import React, { useEffect, useRef, useState } from 'react'
import { markedText } from '../../../utils/TextUtil'
import axios from 'axios'
import UrlEditModal from './UrlEditModal'

const EditAboutMe = ({ aboutMe, setIconOpen }) => {
    const [isEdit, setIsEdit] = useState(false)
    const [editItem, setEditItem] = useState('')

    const [isIntroductionMakredText, setIsIntroductionMakredText] = useState(true)
    const introductionRef = useRef(null)
    const adjustIntroductionHeight = () => {
        const textarea = introductionRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    };

    const [isHistoryMakredText, setIsHistoryMakredText] = useState(true)
    const historyRef = useRef(null)
    const adjustHistoryHeight = () => {
        const textarea = historyRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    };

    const [isSkillMakredText, setIsSkillMakredText] = useState(true)
    const skillRef = useRef(null)
    const adjustSkillHeight = () => {
        const textarea = skillRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    };

    const [formData, setFormData] = useState({
        id: aboutMe[0].id,
        name: aboutMe[0].name,
        sub_name: aboutMe[0].sub_name,
        introduction: aboutMe[0].introduction,
        history: aboutMe[0].history,
        skill: aboutMe[0].skill,
        mail: aboutMe[0].mail,
        github_url: aboutMe[0].github_url,
        github_name: aboutMe[0].github_name,
        image: aboutMe[0].image,
    })

    const handleChange = (event) => {
        setFormData(prev => ({ ...prev, [event.target.name]: event.target.value }));
    };

    useEffect(() => {
        const updateAboutMe = async () => {
            try {
                await axios.post(`${process.env.REACT_APP_API_DOMAIN}/aboutme/update`, formData, {
                    headers: {
                        'Authorization': localStorage.getItem('token')
                    }
                });
            } catch (error) {
                console.error('Error uploading data:', error);
            }
        };

        if (Object.keys(formData).length > 0) {
            updateAboutMe();
        }
    }, [formData]);


    return (
        <>
            <div className="flex items-center justify-center my-4 max-md:my-2">
                <img loading="lazy" onClick={() => setIconOpen(true)} src={formData.image} alt="" className="w-1/6 max-md:w-1/5 max-sm:w-1/4 border-white border-2 rounded-full cursor-pointer hover:opacity-80" />
                <div className="ml-8 w-2/3 max-sm:w-3/4">
                    <input
                        className="ml-2 font-bold text-4xl max-md:text-3xl max-sm:text-2xl outline-none border-b-2 border-gray-300 block"
                        type="text"
                        maxLength={255}
                        value={formData.name}
                        name="name"
                        onChange={(event) => handleChange(event)}
                    />
                    <input
                        className="font-bold text-2xl max-md:text-xl max-sm:text-lg outline-none border-b-2 border-gray-300 block"
                        type="text"
                        maxLength={255}
                        value={formData.sub_name}
                        name="sub_name"
                        onChange={(event) => handleChange(event)}
                    />
                </div>
            </div>
            <div className="flex justify-between items-start mb-4 max-sm:flex-col">
                <div className="w-3/4 max-sm:w-full max-sm:mb-2">
                    <h4>経歴</h4>
                    <div
                        className={`${isHistoryMakredText ? "block" : "hidden"} ml-2`}
                        dangerouslySetInnerHTML={markedText(formData.history)}
                        onClick={() => {
                            setIsHistoryMakredText(false)
                            setTimeout(() => {
                                historyRef.current.focus()
                                historyRef.current.setSelectionRange(0, 0);
                                adjustHistoryHeight()
                            }, 1)
                        }}
                    />
                    <textarea
                        name="history"
                        className={`${isHistoryMakredText ? "hidden" : "block"} w-full focus:outline-none scroll-hidden ml-2`}
                        value={(formData.history)}
                        onBlur={() => setIsHistoryMakredText(true)}
                        ref={historyRef}
                        onChange={(event) => {
                            handleChange(event)
                            adjustHistoryHeight()
                        }}
                    />
                </div>
                <div className="w-1/4 max-sm:w-full">
                    <h4>スキル</h4>
                    <div
                        className={`${isSkillMakredText ? "block" : "hidden"} ml-2`}
                        dangerouslySetInnerHTML={markedText(formData.skill)}
                        onClick={() => {
                            setIsSkillMakredText(false)
                            setTimeout(() => {
                                skillRef.current.focus()
                                skillRef.current.setSelectionRange(0, 0);
                                adjustSkillHeight()
                            }, 1)
                        }}
                    />
                    <textarea
                        name="skill"
                        className={`${isSkillMakredText ? "hidden" : "block"} w-full focus:outline-none scroll-hidden ml-2`}
                        value={(formData.skill)}
                        onBlur={() => setIsSkillMakredText(true)}
                        ref={skillRef}
                        onChange={(event) => {
                            handleChange(event)
                            adjustSkillHeight()
                        }}
                    />
                </div>
            </div>
            <div className="flex max-md:flex-col my-4 items-center">
                <div className="w-5/6 max-lg:w-4/6 mr-8 max-md:mr-0 max-md:w-full max-md:text-sm">
                    <div
                        className={`${isIntroductionMakredText ? "block" : "hidden"}`}
                        dangerouslySetInnerHTML={markedText(formData.introduction)}
                        onClick={() => {
                            setIsIntroductionMakredText(false)
                            setTimeout(() => {
                                introductionRef.current.focus()
                                introductionRef.current.setSelectionRange(0, 0);
                                adjustIntroductionHeight()
                            }, 1)
                        }}
                    />
                    <textarea
                        name="introduction"
                        className={`${isIntroductionMakredText ? "hidden" : "block"} w-full focus:outline-none scroll-hidden`}
                        value={(formData.introduction)}
                        onBlur={() => setIsIntroductionMakredText(true)}
                        ref={introductionRef}
                        onChange={(event) => {
                            handleChange(event)
                            adjustIntroductionHeight()
                        }}
                    />
                </div>
                <div className="w-1/6 max-md:w-full max-md:mt-4 max-md:flex max-md:flex-col max-md:items-center text-lg">
                    <a className="flex hover:opacity-80 w-fit max-md:text-sm" href={`mailto:${formData.mail}`} target="_blank" rel="noopener noreferrer" onContextMenu={(event) => {
                        setIsEdit(true)
                        setEditItem("mail")
                        event.preventDefault()
                    }}>
                        <EnvelopeIcon className="w-6 h-6 max-md:w-5 max-md:h-5 mr-1"></EnvelopeIcon>{formData.mail}
                    </a>
                    <div className="max-md:flex max-md:justify-evenly max-md:gap-4 max-md:mt-1">
                        <a className="flex hover:opacity-80 w-fit max-md:text-sm" href={formData.github_url} target="_blank" rel="noopener noreferrer" onContextMenu={(event) => {
                            setIsEdit(true)
                            setEditItem("github")
                            event.preventDefault()
                        }}>
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 max-md:w-5 max-md:h-5 mr-1 fill-black"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.463 2 11.97c0 4.404 2.865 8.14 6.839 9.458.5.092.682-.216.682-.48 0-.236-.008-.864-.013-1.695-2.782.602-3.369-1.337-3.369-1.337-.454-1.151-1.11-1.458-1.11-1.458-.908-.618.069-.606.069-.606 1.003.07 1.531 1.027 1.531 1.027.892 1.524 2.341 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.251-4.555-1.107-4.555-4.927 0-1.088.39-1.979 1.029-2.675-.103-.252-.446-1.266.098-2.638 0 0 .84-.268 2.75 1.022A9.607 9.607 0 0 1 12 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.386.1 2.638.64.696 1.028 1.587 1.028 2.675 0 3.83-2.339 4.673-4.566 4.92.359.307.678.915.678 1.846 0 1.332-.012 2.407-.012 2.734 0 .267.18.577.688.48 3.97-1.32 6.833-5.054 6.833-9.458C22 6.463 17.522 2 12 2Z"></path></svg>
                            {formData.github_name}
                        </a>
                    </div>
                </div>
            </div>
            <UrlEditModal isOpen={isEdit} setIsOpen={setIsEdit} formData={formData} editItem={editItem} handleChange={handleChange} />
        </>
    )
}

export default EditAboutMe