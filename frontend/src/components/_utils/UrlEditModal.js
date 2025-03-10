import { Dialog, Transition } from '@headlessui/react'
import React, { Fragment } from 'react'

const UrlEditModal = ({ isOpen, setIsOpen, formData, editItem, handleChange }) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-20" onClose={() => setIsOpen(false)}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50" />
                </Transition.Child>
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="relative max-w-xl w-full mx-auto">
                            <div className="relative rounded-xl border-8 border-main bg-white py-4 px-8">
                                <div className="text-center text-xl font-bold">
                                    {editItem}編集中
                                </div>
                                {editItem === "mail" && (
                                    <>
                                        <div className="text-gray-600">メールアドレス</div>
                                        <input
                                            className="outline-none border-b-2 border-gray-300 block w-full"
                                            type="email"
                                            maxLength={255}
                                            value={formData.mail}
                                            name="mail"
                                            onChange={(event) => handleChange(event)}
                                        />
                                    </>
                                )}
                                {editItem === "github" && (
                                    <>
                                        <div className="text-gray-600">GitHub 名前</div>
                                        <input
                                            className="outline-none border-b-2 border-gray-300 block w-full"
                                            type="text"
                                            maxLength={255}
                                            value={formData.github_name}
                                            name="github_name"
                                            onChange={(event) => handleChange(event)}
                                        />
                                        <div className="text-gray-600">GitHub URL</div>
                                        <input
                                            className="outline-none border-b-2 border-gray-300 block w-full"
                                            type="text"
                                            maxLength={255}
                                            value={formData.github_url}
                                            name="github_url"
                                            onChange={(event) => handleChange(event)}
                                        />
                                    </>
                                )}
                                {editItem === "work" && (
                                    <>
                                        <div className="text-gray-600">関連URL 名前</div>
                                        <input
                                            className="outline-none border-b-2 border-gray-300 block w-full"
                                            type="text"
                                            maxLength={255}
                                            value={formData.url_name}
                                            name="url_name"
                                            onChange={(event) => handleChange(event)}
                                        />
                                        <div className="text-gray-600">関連URL</div>
                                        <input
                                            className="outline-none border-b-2 border-gray-300 block w-full"
                                            type="text"
                                            maxLength={255}
                                            value={formData.url}
                                            name="url"
                                            onChange={(event) => handleChange(event)}
                                        />
                                    </>
                                )}
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    )
}

export default UrlEditModal