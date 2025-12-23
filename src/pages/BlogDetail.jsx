import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Clock, Tag, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import './BlogDetail.css';

const BlogDetail = () => {
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState('');

  // Sample blog posts data (in a real app, this would come from an API)
  const blogPosts = {
    '1': {
      title: '10 Essential Travel Tips for First-Time International Travelers',
      excerpt: 'Planning your first international trip? Here are the essential tips you need to know before you embark on your adventure...',
      category: 'Travel Tips',
      author: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        bio: 'Travel writer and photographer with 10+ years of experience exploring the world.'
      },
      date: '2024-01-15',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop',
      tags: ['Tips', 'International', 'Beginner', 'Planning'],
      content: `
        <p>Embarking on your first international trip is an exciting milestone that opens up a world of new experiences, cultures, and memories. However, it can also feel overwhelming with all the planning and preparation involved. Don't worry – we've compiled the essential tips to ensure your first international adventure is smooth, safe, and unforgettable.</p>

        <h2>1. Check Your Passport and Visa Requirements Early</h2>
        <p>This might seem obvious, but it's crucial to check your passport validity well in advance. Most countries require your passport to be valid for at least six months beyond your planned return date. Additionally, research visa requirements for your destination country, as processing times can vary significantly.</p>
        <p><strong>Pro tip:</strong> Make photocopies of your passport and store them separately from the original. Also, save digital copies in your email or cloud storage.</p>

        <h2>2. Notify Your Bank and Credit Card Companies</h2>
        <p>There's nothing worse than having your card blocked for suspicious activity when you're halfway around the world. Before you leave, inform your bank and credit card companies about your travel dates and destinations. This prevents unexpected card freezes and ensures you have access to your funds.</p>
        <p>Also, consider getting a credit card with no foreign transaction fees to save money on every purchase abroad.</p>

        <h2>3. Get Travel Insurance</h2>
        <p>Travel insurance is non-negotiable for international trips. It protects you against unexpected events like medical emergencies, trip cancellations, lost luggage, and more. The peace of mind it provides is worth every penny.</p>
        <p>Look for policies that cover:</p>
        <ul>
          <li>Medical emergencies and evacuation</li>
          <li>Trip cancellation and interruption</li>
          <li>Lost, stolen, or delayed baggage</li>
          <li>Emergency assistance services</li>
        </ul>

        <h2>4. Learn Basic Local Phrases</h2>
        <p>While English is widely spoken in many tourist destinations, learning basic phrases in the local language shows respect and can significantly enhance your experience. At minimum, learn how to say:</p>
        <ul>
          <li>Hello and goodbye</li>
          <li>Please and thank you</li>
          <li>Yes and no</li>
          <li>Where is...?</li>
          <li>How much does this cost?</li>
          <li>I need help</li>
        </ul>
        <p>Download a translation app like Google Translate for more complex conversations.</p>

        <h2>5. Pack Smart and Light</h2>
        <p>First-time travelers often make the mistake of overpacking. Remember, you'll likely buy souvenirs and need space in your luggage for the return journey. Pack versatile clothing items that can be mixed and matched, and consider doing laundry during your trip for longer stays.</p>
        <p><strong>Essential items to pack:</strong></p>
        <ul>
          <li>Universal power adapter</li>
          <li>Portable charger</li>
          <li>First-aid kit with basic medications</li>
          <li>Copies of important documents</li>
          <li>Comfortable walking shoes</li>
        </ul>

        <h2>6. Understand Currency Exchange</h2>
        <p>Familiarize yourself with the local currency and current exchange rates before you arrive. Avoid exchanging money at airports, as they typically offer poor rates. Instead, use ATMs at your destination or exchange money at local banks for better rates.</p>
        <p>Keep some local currency on hand for taxis, tips, and small purchases, but don't carry excessive amounts of cash.</p>

        <h2>7. Research Local Customs and Etiquette</h2>
        <p>Different cultures have different norms and expectations. What's acceptable in your home country might be offensive elsewhere. Research local customs, dress codes, tipping practices, and social etiquette to avoid unintentional faux pas.</p>
        <p>For example:</p>
        <ul>
          <li>In Japan, it's customary to remove shoes when entering homes and some restaurants</li>
          <li>In Middle Eastern countries, showing the bottom of your feet is considered disrespectful</li>
          <li>In many European countries, tipping is included in the bill</li>
        </ul>

        <h2>8. Stay Connected</h2>
        <p>Having access to the internet abroad is crucial for navigation, communication, and emergencies. Options include:</p>
        <ul>
          <li>International roaming plans from your carrier</li>
          <li>Local SIM cards (often the most economical option)</li>
          <li>Portable WiFi devices</li>
          <li>Relying on free WiFi at hotels and cafes</li>
        </ul>
        <p>Download offline maps and important information before your trip in case you lose internet access.</p>

        <h2>9. Register with Your Embassy</h2>
        <p>Many countries offer free registration programs for citizens traveling abroad. This allows your government to contact you in case of emergencies, natural disasters, or civil unrest. It's a simple safety precaution that takes just a few minutes.</p>

        <h2>10. Keep an Open Mind and Be Flexible</h2>
        <p>Things won't always go according to plan, and that's okay! Flights get delayed, weather changes plans, and unexpected opportunities arise. The best travel experiences often come from spontaneous moments and embracing the unexpected.</p>
        <p>Stay flexible, maintain a positive attitude, and remember that challenges often make the best stories later.</p>

        <h2>Final Thoughts</h2>
        <p>Your first international trip is the beginning of a lifetime of adventures. While preparation is important, don't let fear or overthinking prevent you from taking the leap. With these essential tips, you're well-equipped to navigate your first international journey with confidence.</p>
        <p>Remember, every experienced traveler was once a first-timer too. Embrace the experience, stay safe, and most importantly, have fun exploring our beautiful world!</p>
      `
    },
    '2': {
      title: 'The Ultimate Guide to Exploring Southeast Asia on a Budget',
      excerpt: 'Discover how to travel through Southeast Asia without breaking the bank...',
      category: 'Travel Guides',
      author: {
        name: 'Michael Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        bio: 'Adventure seeker and budget travel expert specializing in Southeast Asia.'
      },
      date: '2024-01-12',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200&h=600&fit=crop',
      tags: ['Budget Travel', 'Asia', 'Guide', 'Backpacking'],
      content: '<p>Southeast Asia is a backpacker\'s paradise, offering incredible experiences at affordable prices. This comprehensive guide will show you how to maximize your adventure while minimizing costs...</p>'
    }
  };

  const post = blogPosts[id] || blogPosts['1'];

  // Related posts (excluding current post)
  const relatedPosts = Object.entries(blogPosts)
    .filter(([key]) => key !== id)
    .slice(0, 3)
    .map(([key, value]) => ({ id: key, ...value }));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = post.title;

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <>
      <SEO
        title={`${post.title} | Zanafly Blog`}
        description={post.excerpt}
        keywords={post.tags.join(', ')}
        canonical={`/blog/${id}`}
      />

      <div className="blog-detail-page">
        <Header />

        {/* Hero Section */}
        <div className="blog-detail-hero">
          <div className="blog-detail-hero-overlay"></div>
          <img src={post.image} alt={post.title} className="blog-detail-hero-image" />
          <div className="container">
            <div className="blog-detail-hero-content">
              <Link to="/blog" className="blog-detail-back">
                <ArrowLeft size={20} />
                Back to Blog
              </Link>
              <div className="blog-detail-category">{post.category}</div>
              <h1 className="blog-detail-title">{post.title}</h1>
              <div className="blog-detail-meta">
                <div className="blog-detail-meta-item">
                  <User size={16} />
                  {post.author.name}
                </div>
                <div className="blog-detail-meta-item">
                  <Calendar size={16} />
                  {new Date(post.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className="blog-detail-meta-item">
                  <Clock size={16} />
                  {post.readTime}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="blog-detail-content">
          <div className="container">
            <div className="blog-detail-layout">
              {/* Sidebar */}
              <aside className="blog-detail-sidebar">
                {/* Author Info */}
                <div className="blog-detail-author-card">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="blog-detail-author-avatar"
                  />
                  <h3 className="blog-detail-author-name">{post.author.name}</h3>
                  <p className="blog-detail-author-bio">{post.author.bio}</p>
                </div>

                {/* Share Buttons */}
                <div className="blog-detail-share-card">
                  <h3 className="blog-detail-share-title">Share this article</h3>
                  <div className="blog-detail-share-buttons">
                    <button
                      onClick={() => handleShare('facebook')}
                      className="blog-detail-share-btn facebook"
                      aria-label="Share on Facebook"
                    >
                      <Facebook size={20} />
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="blog-detail-share-btn twitter"
                      aria-label="Share on Twitter"
                    >
                      <Twitter size={20} />
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="blog-detail-share-btn linkedin"
                      aria-label="Share on LinkedIn"
                    >
                      <Linkedin size={20} />
                    </button>
                    <button
                      onClick={() => handleShare('email')}
                      className="blog-detail-share-btn email"
                      aria-label="Share via Email"
                    >
                      <Mail size={20} />
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="blog-detail-share-btn copy"
                      aria-label="Copy link"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div className="blog-detail-tags-card">
                  <h3 className="blog-detail-tags-title">Tags</h3>
                  <div className="blog-detail-tags">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="blog-detail-tag">
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Article Content */}
              <article className="blog-detail-article">
                <div
                  className="blog-detail-body"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Related Posts */}
                <div className="blog-detail-related">
                  <h2 className="blog-detail-related-title">Related Articles</h2>
                  <div className="blog-detail-related-grid">
                    {relatedPosts.map((related) => (
                      <Link
                        key={related.id}
                        to={`/blog/${related.id}`}
                        className="blog-detail-related-card"
                      >
                        <img
                          src={related.image}
                          alt={related.title}
                          className="blog-detail-related-image"
                        />
                        <div className="blog-detail-related-content">
                          <span className="blog-detail-related-category">
                            {related.category}
                          </span>
                          <h3 className="blog-detail-related-title-text">
                            {related.title}
                          </h3>
                          <p className="blog-detail-related-meta">
                            {related.author.name} • {related.readTime}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default BlogDetail;
