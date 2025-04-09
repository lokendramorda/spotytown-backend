// Suggestions.js
import React, { useRef, useState } from "react";
import axios from 'axios';
import '../App.css';
import { styles } from "../styles";

const Suggestions = () => {
  const formRef = useRef();
  const [form, setForm] = useState({
    name: "",
    playlistUrl: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('http://localhost:5000/api/suggestions', form);
      alert("Thank you for your suggestion! Check out Posts section.");
      setForm({ name: "", playlistUrl: "" });
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[300px] bg-hero-pattern2 max-h-[500px] bg-cover bg-no-repeat bg-center">
      <div className="gap-10 overflow-hidden mx-auto max-w-screen-xl">
        <div className='flex flex-col xs:flex-row bg-black-100 p-8 rounded-2xl justify-between'>
          <div className="my-auto w-100"> 
            <p className={styles.sectionSubText}>wanna add your</p>
            <h3 className={styles.sectionHeadText}>Suggestions?</h3>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className='mt-12 flex flex-col gap-8 xs:mx-auto'>
            <label className='flex flex-col'>
              <span className='text-white font-medium mb-4'>Your Name</span>
              <input
                type='text'
                name='name'
                value={form.name}
                onChange={handleChange}
                required
                className='bg-tertiary py-4 px-6 placeholder:text-secondary text-black rounded-lg outline-none border-none font-medium'
              />
            </label>
            <label className='flex flex-col'>
              <span className='text-white font-medium mb-4'>Playlist/Song URL</span>
              <input
                type='url'
                name='playlistUrl'
                value={form.playlistUrl}
                onChange={handleChange}
                required
                placeholder='https://open.spotify.com/playlist/...'
                className='bg-tertiary py-4 px-6 placeholder:text-secondary text-black rounded-lg outline-none border-none font-medium'
              />
            </label>
            <button
              type='submit'
              className='bg-green-700 hover:bg-green-900 py-3 px-8 rounded-xl outline-none w-fit text-white font-bold shadow-md shadow-primary'
              disabled={loading}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Suggestions;