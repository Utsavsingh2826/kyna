import React from 'react';

const EarringsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light mb-4 text-gray-800">Earrings Collection</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Elegant earrings to complement your style, from subtle studs to statement pieces
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {['Studs', 'Hoops', 'Halo Earrings', 'Fashion Earrings', 'Drop Earrings'].map((type) => (
            <div key={type} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-64 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">{type}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{type}</h3>
                <p className="text-gray-600">Beautiful designs for every occasion</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EarringsPage;