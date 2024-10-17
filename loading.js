(function() {
  // Define the ResourceLoader object
  const ResourceLoader = {
    graphicPath: '', // Customizable path to the loading graphic
    activeRequests: 0, // Track the number of active fetch requests
    loadingScreenId: 'loading-screen',
    contentId: 'main-content',

    // Method to initialize the loader
    init: function(options = {}) {
      // Set the custom graphic path or fallback to a default spinner
      this.graphicPath = options.graphicPath || 'https://i.imgur.com/llF5iyg.gif'; // Default loader graphic

      // Create the loading screen
      this.createLoadingScreen();

      // Override fetch to track requests
      this.overrideFetch();

      // Show the loading screen immediately
      this.showLoadingScreen();

      // Wait for static resources to load
      this.waitForPageLoad();
    },

    // Method to create the loading screen dynamically
    createLoadingScreen: function() {
      // Inject basic CSS for the loading screen into the document
      const style = document.createElement('style');
      style.textContent = `
        #${this.loadingScreenId} {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(255, 255, 255, 0.9); /* Semi-transparent background */
          z-index: 9999;
          flex-direction: column;
        }
        #${this.loadingScreenId} img {
          width: 100px;
          height: 100px;
        }
        #${this.loadingScreenId} p {
          margin-top: 20px;
          font-size: 1.2rem;
          color: #333;
        }
        #${this.contentId} {
          display: none;
        }
      `;
      document.head.appendChild(style);

      // Create the loading screen div and its content
      const loadingScreen = document.createElement('div');
      loadingScreen.id = this.loadingScreenId;

      const spinner = document.createElement('img');
      spinner.src = this.graphicPath; // Set the custom or default graphic path
      spinner.alt = 'Loading...';

      const loadingText = document.createElement('p');
      loadingText.textContent = 'Loading resources, please wait...';

      loadingScreen.appendChild(spinner);
      loadingScreen.appendChild(loadingText);
      
      document.body.appendChild(loadingScreen);
    },

    // Method to show the loading screen
    showLoadingScreen: function() {
      document.getElementById(this.loadingScreenId).style.display = 'flex';
      document.getElementById(this.contentId).style.display = 'none';
    },

    // Method to hide the loading screen and show the content
    hideLoadingScreen: function() {
      if (this.activeRequests === 0) {
        document.getElementById(this.loadingScreenId).style.display = 'none';
        document.getElementById(this.contentId).style.display = 'block';
      }
    },

    // Override fetch to track active requests
    overrideFetch: function() {
      const originalFetch = window.fetch;
      const self = this; // Preserve the context of the ResourceLoader object

      window.fetch = function(...args) {
        self.activeRequests++;
        self.showLoadingScreen();

        return originalFetch(...args)
          .then(response => {
            self.activeRequests--;
            if (self.activeRequests === 0) {
              self.hideLoadingScreen();
            }
            return response;
          })
          .catch(error => {
            self.activeRequests--;
            if (self.activeRequests === 0) {
              self.hideLoadingScreen();
            }
            throw error;
          });
      };
    },

    // Wait for the page's static resources to load
    waitForPageLoad: function() {
      const self = this;

      // Wait for all static resources (images, scripts, stylesheets) to load
      window.addEventListener('load', function() {
        if (self.activeRequests === 0) {
          self.hideLoadingScreen();
        }
      });
    }
  };

  // Automatically initialize the ResourceLoader on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function() {
    // Check if the script has been initialized with a custom graphic path
    if (window.CustomLoaderOptions && window.CustomLoaderOptions.graphicPath) {
      ResourceLoader.init(window.CustomLoaderOptions);
    } else {
      // Default initialization if no custom path is provided
      ResourceLoader.init();
    }
  });

  // Expose ResourceLoader globally (optional, if you want to manually initialize or access it)
  window.ResourceLoader = ResourceLoader;
})();
