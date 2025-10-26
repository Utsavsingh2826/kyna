import React from 'react';

const RingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light mb-4 text-gray-800">Rings Collection</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our exquisite collection of rings, from classic solitaires to modern designs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-64 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Solitaire Rings</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">Solitaire Collection</h3>
              <p className="text-gray-600">Timeless elegance in every piece</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-64 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Engagement Rings</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">Engagement Collection</h3>
              <p className="text-gray-600">Perfect symbols of eternal love</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-64 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Fashion Rings</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">Fashion Collection</h3>
              <p className="text-gray-600">Contemporary designs for modern style</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RingsPage;