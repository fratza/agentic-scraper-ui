document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const loader = document.querySelector('.loader');
    const scraperForm = document.getElementById('scraper-form');
    const urlInput = document.getElementById('url');
    const scrapeTargetInput = document.getElementById('scrape-target');
    const previewContainer = document.getElementById('preview-container');
    const jsonPreview = document.getElementById('json-preview');
    const scrapeButton = document.getElementById('scrape-button');
    const copyJsonButton = document.getElementById('copy-json');
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    const previewContent = document.querySelector('.preview-content');
    const dataTableContainer = document.getElementById('data-table-container');
    
    // Hide loader after page load
    window.addEventListener('load', function() {
        setTimeout(() => {
            loader.classList.add('hidden');
            document.body.classList.add('fade-in');
        }, 500);
    });
    
    // Animate elements on scroll
    function animateOnScroll() {
        const elements = document.querySelectorAll('.scraper-form-container, .preview-container');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('fade-in');
            }
        });
    }
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on load
    
    // Form submission
    scraperForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Basic validation
        if (!isValidUrl(urlInput.value)) {
            showError(urlInput, 'Please enter a valid URL');
            return;
        } else {
            clearError(urlInput);
        }
        
        if (scrapeTargetInput.value.trim() === '') {
            showError(scrapeTargetInput, 'Please specify what to scrape');
            return;
        } else {
            clearError(scrapeTargetInput);
        }
        
        // Create preview data
        const previewData = {
            url: urlInput.value,
            target: scrapeTargetInput.value,
            timestamp: new Date().toISOString(),
            status: 'ready'
        };
        
        // Display preview
        displayJsonPreview(previewData);
        previewContainer.style.display = 'block';
        previewContainer.classList.add('fade-in');
        
        // Scroll to preview
        setTimeout(() => {
            previewContainer.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    });
    
    // Scrape button action
    scrapeButton.addEventListener('click', function() {
        // Hide button during scraping
        this.style.display = 'none';
        
        // Hide preview content and header immediately
        previewContent.style.display = 'none';
        document.querySelector('.preview-header').style.display = 'none';
        document.querySelector('.preview-actions').style.display = 'none';
        
        // Show progress bar
        progressContainer.style.display = 'block';
        progressFill.style.width = '0%';
        progressPercentage.textContent = '0%';
        
        // Simulate scraping process
        simulateScraping();
    });
    
    // Copy JSON button
    copyJsonButton.addEventListener('click', function() {
        const jsonText = jsonPreview.textContent;
        navigator.clipboard.writeText(jsonText).then(() => {
            // Show temporary success message
            const originalHTML = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i>';
            this.style.backgroundColor = '#10b981';
            this.style.borderColor = '#10b981';
            this.style.color = 'white';
            
            setTimeout(() => {
                this.innerHTML = originalHTML;
                this.style.backgroundColor = '';
                this.style.borderColor = '';
                this.style.color = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            // Show error feedback
            this.innerHTML = '<i class="fas fa-times"></i>';
            this.classList.add('error');
            
            // Reset after 2 seconds
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-copy"></i>';
                this.classList.remove('error');
            }, 2000);
        });
    });
    
    // Helper Functions
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    function showError(inputElement, message) {
        const formGroup = inputElement.closest('.form-group');
        let errorMessage = formGroup.querySelector('.error-message');
        
        inputElement.classList.add('error');
        
        if (!errorMessage) {
            errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            formGroup.appendChild(errorMessage);
        }
        
        errorMessage.textContent = message;
    }
    
    function clearError(inputElement) {
        const formGroup = inputElement.closest('.form-group');
        const errorMessage = formGroup.querySelector('.error-message');
        
        inputElement.classList.remove('error');
        
        if (errorMessage) {
            errorMessage.remove();
        }
    }
    
    function displayJsonPreview(data) {
        jsonPreview.textContent = JSON.stringify(data, null, 2);
    }
    
    function simulateScraping() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 15) + 5;
            progress = Math.min(progress, 100); // Cap at 100%
            
            // Update progress bar
            progressFill.style.width = `${progress}%`;
            progressPercentage.textContent = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                finishScraping();
                return;
            }
        }, 800);
    }
    
    function finishScraping() {
        // Get the target from the form
        const target = scrapeTargetInput.value.toLowerCase();
        let scrapedData;
        
        // Generate different sample data based on what the user wants to scrape
        if (target.includes('price') || target.includes('product')) {
            scrapedData = generateProductData();
        } else if (target.includes('article') || target.includes('blog') || target.includes('news')) {
            scrapedData = generateArticleData();
        } else if (target.includes('image') || target.includes('photo')) {
            scrapedData = generateImageData();
        } else {
            scrapedData = generateGenericData();
        }
        
        // Complete the progress bar animation
        progressFill.style.width = '100%';
        progressPercentage.textContent = '100%';
        
        // Wait a moment at 100% before transitioning
        setTimeout(() => {
            // Fade out progress bar
            progressContainer.classList.add('fade-out');
            
            // After fade out completes, show table
            setTimeout(() => {
                // Hide the progress bar
                progressContainer.style.display = 'none';
                
                // Display data in table format
                displayDataTable(scrapedData);
            }, 500);
        }, 800);
    }
    
    // Sample data generators
    function generateProductData() {
        return [
            { name: "Product A", price: "$29.99", rating: 4.5, inStock: true },
            { name: "Product B", price: "$19.99", rating: 3.8, inStock: true },
            { name: "Product C", price: "$49.99", rating: 4.2, inStock: false },
            { name: "Product D", price: "$39.99", rating: 4.7, inStock: true }
        ];
    }
    
    function generateArticleData() {
        return [
            { title: "Latest Industry News", author: "Jane Doe", date: "2023-05-15", readTime: "5 min" },
            { title: "10 Tips for Success", author: "John Smith", date: "2023-05-10", readTime: "8 min" },
            { title: "The Future of Technology", author: "Alex Johnson", date: "2023-05-05", readTime: "12 min" }
        ];
    }
    
    function generateImageData() {
        return [
            { url: "https://example.com/image1.jpg", alt: "Product showcase", width: 800, height: 600 },
            { url: "https://example.com/image2.jpg", alt: "Team photo", width: 1200, height: 800 },
            { url: "https://example.com/image3.jpg", alt: "Office location", width: 1600, height: 900 }
        ];
    }
    
    function generateGenericData() {
        return [
            { id: 1, title: "Item 1", description: "Description for item 1" },
            { id: 2, title: "Item 2", description: "Description for item 2" },
            { id: 3, title: "Item 3", description: "Description for item 3" },
            { id: 4, title: "Item 4", description: "Description for item 4" }
        ];
    }
    
    // Function to display data in table format
    function displayDataTable(data) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return;
        }
        
        const tableContainer = document.getElementById('data-table-container');
        const tableHead = document.getElementById('table-head');
        const tableBody = document.getElementById('table-body');
        
        // Clear previous content
        tableHead.innerHTML = '';
        tableBody.innerHTML = '';
        
        // Create table header
        const headerRow = document.createElement('tr');
        const keys = Object.keys(data[0]);
        
        keys.forEach(key => {
            const th = document.createElement('th');
            th.textContent = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
            headerRow.appendChild(th);
        });
        
        tableHead.appendChild(headerRow);
        
        // Create table body
        data.forEach(item => {
            const row = document.createElement('tr');
            
            keys.forEach(key => {
                const td = document.createElement('td');
                const value = item[key];
                
                if (typeof value === 'boolean') {
                    // Display boolean values as icons
                    const icon = document.createElement('i');
                    if (value) {
                        icon.className = 'fas fa-check';
                        icon.style.color = '#10b981';
                    } else {
                        icon.className = 'fas fa-times';
                        icon.style.color = '#ef4444';
                    }
                    td.appendChild(icon);
                } else if (value === null || value === undefined) {
                    td.textContent = '-';
                } else if (typeof value === 'object') {
                    td.textContent = JSON.stringify(value);
                } else {
                    td.textContent = value;
                }
                
                row.appendChild(td);
            });
            
            tableBody.appendChild(row);
        });
        
        // Reset any previous classes
        tableContainer.classList.remove('fade-in');
        
        // Show the table container with a fade-in effect
        tableContainer.style.display = 'block';
        
        // Force browser reflow before adding the animation class
        void tableContainer.offsetWidth;
        
        // Add the fade-in class
        tableContainer.classList.add('fade-in');
    }
    
    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.style.boxShadow = 'var(--shadow)';
        } else {
            header.style.boxShadow = 'none';
        }
    });
});
