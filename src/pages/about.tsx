import React from 'react';
import Header from '../components/Header';

const About: React.FC = () => {
    return (
        <div className="bg-light-surface dark:bg-dark-surface min-h-screen transition-colors duration-300">
            <Header isStart={false} />
            <main className="container mx-auto py-12 px-6">
                <section className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-6 transition-colors duration-300">
                        About MedAI Assistant
                    </h1>

                    <div className="bg-light-primary dark:bg-dark-primary p-6 rounded-lg shadow-md dark:shadow-lg-dark mb-8 transition-colors duration-300">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-4 transition-colors duration-300">
                            Our Mission
                        </h2>
                        <p className="text-gray-700 dark:text-gray-200 text-lg transition-colors duration-300">
                            To empower medical students with AI-driven tools and resources that enhance their learning
                            experience and understanding of complex medical concepts.
                        </p>
                    </div>

                    <div className="bg-light-primary dark:bg-dark-primary p-6 rounded-lg shadow-md dark:shadow-lg-dark mb-8 transition-colors duration-300">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-4 transition-colors duration-300">
                            What We Offer
                        </h2>
                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-200 text-lg transition-colors duration-300">
                            <li>AI-Powered Study Tools</li>
                            <li>Comprehensive Medical Resources</li>
                            <li>Interactive Learning Environment</li>
                            <li>Personalized Learning Paths</li>
                        </ul>
                    </div>

                    <div className="bg-light-primary dark:bg-dark-primary p-6 rounded-lg shadow-md dark:shadow-lg-dark transition-colors duration-300">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-4 transition-colors duration-300">
                            Our Team
                        </h2>
                        <p className="text-gray-700 dark:text-gray-200 text-lg transition-colors duration-300">
                            We are a team of dedicated developers, medical professionals, and AI experts passionate about
                            transforming medical education.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default About;