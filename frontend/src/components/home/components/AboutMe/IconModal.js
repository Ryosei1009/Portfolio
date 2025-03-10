import { Dialog, Transition } from '@headlessui/react'
import React, { Fragment } from 'react'

const IconModal = ({ iconOpen, setIconOpen }) => {
    return (
        <Transition appear show={iconOpen} as={Fragment}>
            <Dialog as="div" className="relative z-20" onClose={() => setIconOpen(false)}>
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
                <div className="fixed inset-0">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="flex justify-center transition-opacity top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute outline-none">
                            <img className="w-90vw border-black bg-white border-4" src="/images/aboutme/logo.png" alt="" />
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    )
}

export default IconModal