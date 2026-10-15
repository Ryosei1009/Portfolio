import React from 'react';
import { Link } from 'react-scroll';

const Header = ({ isAuth, setIsAuth }) => {
    return (
        <div className="bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm w-full fixed top-0 inset-x-0 z-10">
            <div className="mx-auto w-3/5 max-lg:w-4/5 max-sm:w-full max-sm:px-2 flex items-center h-16 relative">
                <Link
                    className="hover:opacity-60 cursor-pointer"
                    to="topbanner"
                    smooth={true}
                    offset={-100}
                    duration={500}
                >
                    <div className="w-full px-4 py-4">
                        TOP
                    </div>
                </Link>
                <Link
                    className="hover:opacity-60 cursor-pointer"
                    to="aboutme"
                    smooth={true}
                    offset={-100}
                    duration={500}
                >
                    <div className="w-full px-4 py-4">
                        About Me
                    </div>
                </Link>
                <Link
                    className="hover:opacity-60 cursor-pointer"
                    to="works"
                    smooth={true}
                    offset={-100}
                    duration={500}
                >
                    <div className="w-full px-4 py-4">
                        Works
                    </div>
                </Link>
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