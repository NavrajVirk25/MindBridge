import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State to store our resources
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect runs after the component mounts
  useEffect(() => {
    // Function to fetch resources from our backend
    const fetchResources = async () => {
      try {
        // Make a request to our Express backend
        const response = await fetch('http://localhost:5000/api/resources');
        
        // Check if the request was successful
        if (!response.ok) {
          throw new Error('Failed to fetch resources');
        }
        
        // Parse the JSON response
        const data = await response.json();
        
        // Update our state with the resources
        setResources(data.data);
        setLoading(false);
      } catch (err) {
        // If something goes wrong, store the error
        setError(err.message);
        setLoading(false);
      }
    };

    // Call our fetch function
    fetchResources();
  }, []); // Empty array means this runs once when component mounts

  // Show loading state while fetching
  if (loading) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>MindBridge</h1>
          <p>Loading mental health resources...</p>
        </header>
      </div>
    );
  }

  // Show error if something went wrong
  if (error) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>MindBridge</h1>
          <p>Error: {error}</p>
          <p>Make sure your backend server is running on port 5000</p>
        </header>
      </div>
    );
  }

  // Render our resources
  return (
    <div className="App">
      <header className="App-header">
        <h1>MindBridge</h1>
        <p>Supporting student wellness 24/7</p>
        
        <div className="resources-container">
          <h2>Available Resources</h2>
          {resources.map(resource => (
            <div key={resource.id} className={`resource-card ${resource.urgency}`}>
              <h3>{resource.title}</h3>
              <p className="category">{resource.category}</p>
              <p>{resource.description}</p>
              {resource.phone && (
                <p className="phone">📞 {resource.phone}</p>
              )}
            </div>
          ))}
        </div>
        
        <p className="connection-status">
          ✅ Connected to MindBridge Backend
        </p>
      </header>
    </div>
  );
}

export default App;