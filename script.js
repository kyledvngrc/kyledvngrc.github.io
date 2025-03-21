const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');

        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Close mobile menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });

        // Typed Text Effect
        const typedTextElement = document.getElementById('typed-text');
        const cursor = document.querySelector('.cursor');
        const phrases = ['Web Developer', 'UI/UX Designer', 'Computer Science Student'];
        let phraseIndex = 0;
        let letterIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;

        function type() {
            const currentPhrase = phrases[phraseIndex];
            
            if (isDeleting) {
                typedTextElement.textContent = currentPhrase.substring(0, letterIndex - 1);
                letterIndex--;
                typingSpeed = 50;
            } else {
                typedTextElement.textContent = currentPhrase.substring(0, letterIndex + 1);
                letterIndex++;
                typingSpeed = 100;
            }

            if (!isDeleting && letterIndex === currentPhrase.length) {
                isDeleting = true;
                typingSpeed = 1000; // Pause at the end
            } else if (isDeleting && letterIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typingSpeed = 500; // Pause before typing new phrase
            }

            setTimeout(type, typingSpeed);
        }

        // Start the typing effect
        setTimeout(type, 1000);

        // Animate skill bars when in viewport
        function animateSkills() {
            const skillBars = document.querySelectorAll('.skill-progress');
            
            skillBars.forEach(bar => {
                const width = bar.getAttribute('data-width');
                bar.style.width = `${width}%`;
            });
        }

        // Animated scroll to elements
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });

        // Scroll to top button
        const scrollTopBtn = document.querySelector('.scroll-top');
        
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('active');
            } else {
                scrollTopBtn.classList.remove('active');
            }
            
            // Animate elements when scrolled into view
            document.querySelectorAll('section').forEach(section => {
                const sectionTop = section.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                
                if (sectionTop < windowHeight * 0.8) {
                    section.classList.add('animate');
                    
                    if (section.id === 'about') {
                        animateSkills();
                    }
                    
                    if (section.id === 'projects') {
                        document.querySelectorAll('.project-card').forEach((card, index) => {
                            setTimeout(() => {
                                card.classList.add('visible');
                            }, index * 100);
                        });
                    }
                }
            });
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Project filtering
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterBtns.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                btn.classList.add('active');
                
                const filter = btn.getAttribute('data-filter');
                
                projectCards.forEach(card => {
                    if (filter === 'all' || card.getAttribute('data-category') === filter) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.classList.add('visible');
                        }, 100);
                    } else {
                        card.classList.remove('visible');
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });

        // Form submission
        const contactForm = document.getElementById('contactForm');
        
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            

            
            // For demo purposes, reset the form
            contactForm.reset();
            alert('Message sent successfully!');
        });

        // Initialize animations on page load
        window.addEventListener('load', () => {
            document.querySelectorAll('section').forEach(section => {
                if (section.getBoundingClientRect().top < window.innerHeight) {
                    section.classList.add('animate');
                    
                    if (section.id === 'about') {
                        setTimeout(animateSkills, 500);
                    }
                    
                    if (section.id === 'projects') {
                        document.querySelectorAll('.project-card').forEach((card, index) => {
                            setTimeout(() => {
                                card.classList.add('visible');
                            }, 300 + index * 100);
                        });
                    }
                }
            });
        });