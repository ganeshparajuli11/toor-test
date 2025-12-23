import { useState } from 'react';
import { Calendar, User, Tag, Clock, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import './Blog.css';

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Posts' },
    { id: 'travel-tips', name: 'Travel Tips' },
    { id: 'destinations', name: 'Destinations' },
    { id: 'guides', name: 'Travel Guides' },
    { id: 'reviews', name: 'Reviews' },
    { id: 'news', name: 'Travel News' }
  ];

  const blogPosts = [
    {
      id: 1,
      title: '10 Essential Travel Tips for First-Time International Travelers',
      excerpt: 'Planning your first international trip? Here are the essential tips you need to know before you embark on your adventure...',
      category: 'travel-tips',
      author: 'Sarah Johnson',
      date: '2024-01-15',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop',
      tags: ['Tips', 'International', 'Beginner']
    },
    {
      id: 2,
      title: 'The Ultimate Guide to Exploring Southeast Asia on a Budget',
      excerpt: 'Discover how to travel through Southeast Asia without breaking the bank. From accommodation to food and transport...',
      category: 'guides',
      author: 'Michael Chen',
      date: '2024-01-12',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=400&fit=crop',
      tags: ['Budget Travel', 'Asia', 'Guide']
    },
    {
      id: 3,
      title: 'Hidden Gems: 15 Underrated European Cities You Must Visit',
      excerpt: 'Beyond Paris and Rome, Europe has countless beautiful cities waiting to be explored. Here are our top picks...',
      category: 'destinations',
      author: 'Emma Williams',
      date: '2024-01-10',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&h=400&fit=crop',
      tags: ['Europe', 'Destinations', 'Hidden Gems']
    },
    {
      id: 4,
      title: 'Best Beach Resorts in the Caribbean: 2024 Review',
      excerpt: 'We visited and reviewed the top beach resorts across the Caribbean. Find out which ones offer the best value...',
      category: 'reviews',
      author: 'David Martinez',
      date: '2024-01-08',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&h=400&fit=crop',
      tags: ['Caribbean', 'Beach', 'Luxury']
    },
    {
      id: 5,
      title: 'How to Pack Light: The Minimalist Traveler\'s Guide',
      excerpt: 'Learn the art of packing light with our comprehensive guide. Travel with just a carry-on without sacrificing comfort...',
      category: 'travel-tips',
      author: 'Lisa Anderson',
      date: '2024-01-05',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=600&h=400&fit=crop',
      tags: ['Tips', 'Packing', 'Minimalism']
    },
    {
      id: 6,
      title: 'Sustainable Tourism: How to Travel Responsibly in 2024',
      excerpt: 'Make a positive impact on the destinations you visit. Here\'s how to be a more responsible and sustainable traveler...',
      category: 'news',
      author: 'James Wilson',
      date: '2024-01-03',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=400&fit=crop',
      tags: ['Sustainability', 'Eco-friendly', 'Responsible Travel']
    },
    {
      id: 7,
      title: 'Solo Travel Safety: Essential Tips for Female Travelers',
      excerpt: 'Traveling solo as a woman can be incredibly rewarding. Here are our top safety tips and destination recommendations...',
      category: 'travel-tips',
      author: 'Rachel Green',
      date: '2024-01-01',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop',
      tags: ['Solo Travel', 'Safety', 'Women Travel']
    },
    {
      id: 8,
      title: 'Best Winter Ski Resorts in the Alps: Complete Guide',
      excerpt: 'From beginner slopes to expert runs, discover the best ski resorts in the Alps for every skill level...',
      category: 'destinations',
      author: 'Mark Thompson',
      date: '2023-12-28',
      readTime: '9 min read',
      image: 'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=600&h=400&fit=crop',
      tags: ['Skiing', 'Winter', 'Alps']
    },
    {
      id: 9,
      title: 'Digital Nomad Hotspots: Best Cities for Remote Work in 2024',
      excerpt: 'Looking to work remotely while traveling? These cities offer the perfect blend of culture, connectivity, and cost...',
      category: 'guides',
      author: 'Alex Turner',
      date: '2023-12-25',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=400&fit=crop',
      tags: ['Digital Nomad', 'Remote Work', 'Cities']
    }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts[0];

  return (
    <>
      <SEO
        title="Travel Blog | Zanafly - Tips, Guides & Inspiration"
        description="Explore our travel blog for tips, destination guides, reviews, and inspiration for your next adventure."
        keywords="travel blog, travel tips, destination guides, travel inspiration"
        canonical="/blog"
      />

      <div className="blog-page">
        <Header />

        {/* Hero Section */}
        <div className="blog-hero">
          <div className="container">
            <h1 className="blog-hero-title">Travel Blog</h1>
            <p className="blog-hero-subtitle">
              Discover travel tips, destination guides, and inspiring stories from around the world
            </p>

            {/* Search Bar */}
            <div className="blog-search-bar">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="blog-search-input"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="blog-content">
          <div className="container">
            <div className="blog-layout">
              {/* Sidebar */}
              <aside className="blog-sidebar">
                <div className="blog-sidebar-card">
                  <h3 className="blog-sidebar-title">Categories</h3>
                  <div className="blog-categories">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`blog-category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                      >
                        <Tag size={16} />
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Tags */}
                <div className="blog-sidebar-card">
                  <h3 className="blog-sidebar-title">Popular Tags</h3>
                  <div className="blog-tags">
                    <span className="blog-tag">Travel Tips</span>
                    <span className="blog-tag">Budget Travel</span>
                    <span className="blog-tag">Europe</span>
                    <span className="blog-tag">Asia</span>
                    <span className="blog-tag">Beach</span>
                    <span className="blog-tag">Adventure</span>
                    <span className="blog-tag">Luxury</span>
                    <span className="blog-tag">Solo Travel</span>
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <main className="blog-main">
                {/* Featured Post */}
                {selectedCategory === 'all' && !searchQuery && (
                  <div className="featured-post">
                    <div className="featured-post-image-wrapper">
                      <img
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        className="featured-post-image"
                      />
                      <div className="featured-badge">Featured</div>
                    </div>
                    <div className="featured-post-content">
                      <div className="featured-post-meta">
                        <span className="featured-post-category">{categories.find(c => c.id === featuredPost.category)?.name}</span>
                        <span className="featured-post-date">
                          <Calendar size={14} />
                          {new Date(featuredPost.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h2 className="featured-post-title">{featuredPost.title}</h2>
                      <p className="featured-post-excerpt">{featuredPost.excerpt}</p>
                      <div className="featured-post-footer">
                        <div className="featured-post-author">
                          <User size={16} />
                          <span>{featuredPost.author}</span>
                        </div>
                        <Link to={`/blog/${featuredPost.id}`} className="featured-post-link">
                          Read More <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Blog Posts Grid */}
                <div className="blog-posts-header">
                  <h2 className="blog-posts-title">
                    {selectedCategory === 'all' ? 'Latest Posts' : categories.find(c => c.id === selectedCategory)?.name}
                  </h2>
                  <span className="blog-posts-count">{filteredPosts.length} articles</span>
                </div>

                <div className="blog-posts-grid">
                  {filteredPosts.map(post => (
                    <article key={post.id} className="blog-post-card">
                      <div className="blog-post-image-wrapper">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="blog-post-image"
                        />
                        <div className="blog-post-category">{categories.find(c => c.id === post.category)?.name}</div>
                      </div>
                      <div className="blog-post-content">
                        <div className="blog-post-meta">
                          <span className="blog-post-date">
                            <Calendar size={14} />
                            {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="blog-post-read-time">
                            <Clock size={14} />
                            {post.readTime}
                          </span>
                        </div>
                        <h3 className="blog-post-title">{post.title}</h3>
                        <p className="blog-post-excerpt">{post.excerpt}</p>
                        <div className="blog-post-footer">
                          <div className="blog-post-author">
                            <User size={14} />
                            <span>{post.author}</span>
                          </div>
                          <Link to={`/blog/${post.id}`} className="blog-post-link">
                            Read More <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* No Results */}
                {filteredPosts.length === 0 && (
                  <div className="no-results">
                    <h3>No posts found</h3>
                    <p>Try adjusting your search or filters</p>
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Blog;
