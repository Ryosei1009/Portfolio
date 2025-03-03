import React from 'react';
import { Link } from 'react-scroll';

const Header = () => {
    return (
        <div className="bg-white bg-opacity-70 w-full fixed z-10">
            <div className="mx-auto w-3/5 max-sm:mx-8 max-sm:w-full flex items-center h-16 relative">
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
            </div>
        </div>
    );
}

export default Header;