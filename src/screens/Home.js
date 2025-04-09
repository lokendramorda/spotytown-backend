import React from 'react'
import { NavbarDark } from '../components/Navbar';
import { styles } from "../styles";
import Playlists from './Playlists';

const Home = () => {
  return (
    <>
    <div className='pt-5'>< NavbarDark /></div>
    

    <section className={`relative xs:h-[40rem] flex lg:flex-row justify-end mr-12 items-center gap-40 hero-main flex-col-reverse`}>
      
      
        
        <div className="xs:h-[20rem] flex flex-row justify-start text-center">
             
           <div className="text-center  text-white  text-6xl flex flex-col lg:flex-col">
           
               <div className="flex flex-col lg:flex-row mr-0 items-center">
                      <div className={`${styles.heroHeadText} mt-[1rem]`}>
                            <h1><span className='text-green-700 xs:visible invisible'>SPOTY TOWN</span>
                            </h1>
                      </div>
              </div>

                 <div className="lg:text-right xs:mr-7 mr-auto ">
                   <p className={`${styles.heroSubText} text-start xs:text-end text-white xs:max-w-[900px] mt-[2rem] xs:text-[2rem]`}>
                      Find your prefered music <br/>
                       And playlists.
                 </p>
               </div>

           </div>
           <div className='flex flex-col justify-center items-center mt-5 invisible lg:visible lg:mr-5'>
              <div className='w-5 h-5 rounded-full bg-green-700' />
              <div className='w-1 sm:h-80 h-40 bg-green-700 green-gradient' />
             </div>
        </div>

    </section>
    <Playlists/>
    </>
  )
}

export default Home;