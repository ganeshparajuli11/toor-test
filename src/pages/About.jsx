import { Globe, Users, Heart, Award, Target, Zap } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import './About.css';

const About = () => {
  const stats = [
    { value: '10M+', label: 'Happy Travelers' },
    { value: '500+', label: 'Destinations' },
    { value: '15+', label: 'Years Experience' },
    { value: '98%', label: 'Customer Satisfaction' }
  ];

  const values = [
    {
      icon: <Heart size={32} />,
      title: 'Customer First',
      description: 'We put our customers at the heart of everything we do, ensuring the best travel experiences.'
    },
    {
      icon: <Target size={32} />,
      title: 'Excellence',
      description: 'We strive for excellence in every aspect of our service, from booking to your return home.'
    },
    {
      icon: <Globe size={32} />,
      title: 'Global Reach',
      description: 'Access to destinations worldwide with local expertise and international standards.'
    },
    {
      icon: <Zap size={32} />,
      title: 'Innovation',
      description: 'Leveraging the latest technology to make your travel planning seamless and enjoyable.'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
      description: 'With 20+ years in the travel industry, Sarah founded Zanafly with a vision to democratize travel.'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
      description: 'Michael leads our technology team, ensuring our platform stays cutting-edge and user-friendly.'
    },
    {
      name: 'Emma Williams',
      role: 'Head of Customer Success',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop',
      description: 'Emma ensures every customer has an exceptional experience from booking to return.'
    },
    {
      name: 'David Martinez',
      role: 'Head of Partnerships',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
      description: 'David builds relationships with hotels, airlines, and destinations worldwide.'
    }
  ];

  const milestones = [
    { year: '2010', event: 'Zanafly Founded', description: 'Started with a simple mission: make travel accessible to everyone' },
    { year: '2013', event: 'Reached 1M Users', description: 'Celebrated our millionth happy traveler' },
    { year: '2016', event: 'Global Expansion', description: 'Expanded operations to 50+ countries' },
    { year: '2019', event: 'Mobile App Launch', description: 'Launched our award-winning mobile application' },
    { year: '2022', event: 'Sustainability Initiative', description: 'Committed to carbon-neutral travel options' },
    { year: '2024', event: '10M+ Travelers', description: 'Proudly serving over 10 million travelers worldwide' }
  ];

  return (
    <>
      <SEO
        title="About Us | Zanafly - Your Travel Partner"
        description="Learn about Zanafly, our mission, values, and the team dedicated to making your travel dreams come true."
        keywords="about Zanafly, travel company, our story, our mission"
        canonical="/about"
      />

      <div className="about-page">
        <Header />

        {/* Hero Section */}
        <div className="about-hero">
          <div className="container">
            <h1 className="about-hero-title">About Zanafly</h1>
            <p className="about-hero-subtitle">
              Making Travel Dreams Come True Since 2010
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <section className="about-mission">
          <div className="container">
            <div className="about-mission-content">
              <div className="about-mission-text">
                <h2 className="section-title">Our Mission</h2>
                <p className="section-description">
                  At Zanafly, we believe that travel is more than just visiting new places—it's about creating
                  unforgettable experiences, discovering new cultures, and making lasting memories.
                </p>
                <p className="section-description">
                  Our mission is to make travel accessible, affordable, and enjoyable for everyone. Whether
                  you're planning a weekend getaway or a round-the-world adventure, we're here to help you
                  every step of the way.
                </p>
              </div>
              <div className="about-mission-image">
                <img
                  src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop"
                  alt="Travel"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="about-stats">
          <div className="container">
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="about-values">
          <div className="container">
            <h2 className="section-title center">Our Values</h2>
            <p className="section-subtitle center">
              The principles that guide everything we do
            </p>
            <div className="values-grid">
              {values.map((value, index) => (
                <div key={index} className="value-card">
                  <div className="value-icon">{value.icon}</div>
                  <h3 className="value-title">{value.title}</h3>
                  <p className="value-description">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="about-team">
          <div className="container">
            <h2 className="section-title center">Meet Our Team</h2>
            <p className="section-subtitle center">
              The passionate people behind Zanafly
            </p>
            <div className="team-grid">
              {team.map((member, index) => (
                <div key={index} className="team-card">
                  <div className="team-image-wrapper">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="team-image"
                      loading="lazy"
                    />
                  </div>
                  <div className="team-content">
                    <h3 className="team-name">{member.name}</h3>
                    <p className="team-role">{member.role}</p>
                    <p className="team-description">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="about-timeline">
          <div className="container">
            <h2 className="section-title center">Our Journey</h2>
            <p className="section-subtitle center">
              Key milestones in our story
            </p>
            <div className="timeline">
              {milestones.map((milestone, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-year">{milestone.year}</div>
                    <h3 className="timeline-event">{milestone.event}</h3>
                    <p className="timeline-description">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="about-cta">
          <div className="container">
            <div className="cta-card">
              <Award size={48} className="cta-icon" />
              <h2 className="cta-title">Ready to Start Your Journey?</h2>
              <p className="cta-description">
                Join millions of travelers who trust Zanafly for their adventures
              </p>
              <button className="cta-button">Start Planning</button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default About;
