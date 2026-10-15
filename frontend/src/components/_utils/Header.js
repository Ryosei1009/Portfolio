import React from 'react';

const Header = ({ isAuth, setIsAuth }) => {
    return (
        <div className="bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm w-full fixed top-0 inset-x-0 z-10">
            <div className="mx-auto w-3/5 max-lg:w-4/5 max-sm:w-full max-sm:px-2 flex items-center h-16 relative">
                <a className="hover:opacity-60" href="#top">
                    <div className="w-full px-4 py-4">
                        TOP
                    </div>
                </a>
                <a className="hover:opacity-60" href="#about">
                    <div className="w-full px-4 py-4">
                        About Me
                    </div>
                </a>
                <a className="hover:opacity-60" href="#works">
                    <div className="w-full px-4 py-4">
                        Works
                    </div>
                </a>
                {isAuth && (
                    <div
                        className="hover:opacity-60 cursor-pointer"
                        onClick={() => setIsAuth(false)}
                    >
                        <div className="w-full px-4 py-4">
                            Logout
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Header;