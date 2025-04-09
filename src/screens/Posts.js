import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NavbarDark } from '../components/Navbar';
import { motion } from 'framer-motion';
import { fadeIn } from '../utils/motion';
import '../App.css';
import { styles } from "../styles";

const Posts = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Track view count for a suggestion
  const trackView = async (suggestionId) => {
    try {
      await axios.post(`http://localhost:5000/api/suggestions/${suggestionId}/view`);
      setSuggestions(prev => prev.map(suggestion => 
        suggestion._id === suggestionId 
          ? { ...suggestion, views: (suggestion.views || 0) + 1 } 
          : suggestion
      ));
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };

  // Handle playlist link click
  const handlePlaylistClick = async (e, suggestionId) => {
    e.preventDefault();
    const link = e.currentTarget.href;
    
    // Track the view before navigating
    await trackView(suggestionId);
    
    // Open the link in a new tab
    window.open(link, '_blank');
  };

  // Handle like/dislike reactions
  const handleReaction = async (suggestionId, reaction) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/suggestions/${suggestionId}/react`,
        { reaction },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setSuggestions(prev => prev.map(suggestion => 
        suggestion._id === suggestionId ? {
          ...suggestion,
          likes: response.data.likes,
          dislikes: response.data.dislikes,
          userReaction: response.data.userReaction
        } : suggestion
      ));
    } catch (error) {
      console.error('Reaction error:', error);
      alert("Failed to save reaction. Please try again.");
    }
  };

  // Fetch all suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/suggestions');
        setSuggestions(response.data);
      } catch (error) {
        console.error('Fetch error:', error);
        alert("Failed to load suggestions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSuggestions();
  }, []);

  return (
    
    <div className="min-h-[300px] bg-hero-pattern  bg-cover bg-no-repeat bg-center">
      <div className='pt-5'>< NavbarDark /></div>
      <div className={`${styles.paddingX} ${styles.paddingY} mx-auto max-w-screen-xl`}>
        <div className="text-center mb-16">
          <p className={`${styles.sectionSubText} text-green-400`}>Community</p>
          <h2 className={`${styles.sectionHeadText} text-white`}>Music Suggestions</h2>
          <div className="w-16 h-1 bg-green-500 mx-auto mt-4"></div>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            <p className="text-gray-300 mt-4">Loading suggestions...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion._id}
                variants={fadeIn("up", "spring", index * 0.2, 0.75)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-green-400 transition-all duration-300 shadow-lg hover:shadow-green-500/20"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-green-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
                    {suggestion.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-white font-semibold">{suggestion.name}</h3>
                    <p className="text-gray-400 text-xs">
                      {new Date(suggestion.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 mb-4">
                  <a 
                    href={suggestion.playlistUrl} 
                    onClick={(e) => handlePlaylistClick(e, suggestion._id)}
                    className="inline-flex items-center text-green-400 hover:text-green-300 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    Open Playlist
                  </a>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                  <div className="flex space-x-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReaction(suggestion._id, 'like');
                      }}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-all ${
                        suggestion.userReaction === 'like' 
                          ? 'bg-green-500/90 text-white shadow-lg shadow-green-500/20'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span className="text-lg">👍</span>
                      <span className="text-sm font-medium">{suggestion.likes || 0}</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReaction(suggestion._id, 'dislike');
                      }}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-all ${
                        suggestion.userReaction === 'dislike' 
                          ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/20'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span className="text-lg">👎</span>
                      <span className="text-sm font-medium">{suggestion.dislikes || 0}</span>
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {suggestion.views || 0} views
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Posts;