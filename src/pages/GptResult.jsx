import React, { useState, useEffect } from 'react';
import { GoHome } from 'react-icons/go';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RecipePage = () => {
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          'http://172.30.1.89:8080/recipe/recommend',
          {
            ingredients: ingredients,
          }
        );

        if (response.data) {
          setIngredients(response.data.ingredients);
          setSteps(response.data.recipe);
          setTitle(response.data.foodName);
          setImage(response.data.imgUrl);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [ingredients]);

  //결과화면에서 저장하기
  const handleSaveButtonClick = async () => {
    try {
      await axios.post('http://172.30.1.89:8080/recipe/save', {
        recipeDto: {
          foodName: title,
          imgUrl: image,
          ingredients: ingredients,
          recipe: steps,
        },
      });
      navigate('/mypage');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-4xl font-bold font-score">로딩 중...</h1>
        <button onClick={() => navigate('/main')} className="ml-4 text-5xl">
          <GoHome />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen p-6">
      <div
        className="absolute top-5 left-30 ml-0 border-2 w-10 h-10 transition ease-in-out delay-150 bg-main hover:bg-indigo-500 hover:scale-125 hover:cursor-pointer hover:text-white rounded-full flex items-center justify-center"
        onClick={() => navigate('/board')}
      >
        <FaArrowLeft />
      </div>
      <button
        onClick={() => navigate('/main')}
        className="fixed top-5 right-5 ml-0 border-2 w-10 h-10 text-2xl transition ease-in-out delay-150 bg-white hover:scale-125 hover:cursor-pointer hover:text-black rounded-full flex items-center justify-center"
        title="Go Home"
      >
        <GoHome />
      </button>
      <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden md:max-w-lg">
        <div className="md:flex">
          <div className="w-full p-4 pt-8">
            <div className="border-b-2 border-gray-100 py-2">
              <h1 className="font-score text-2xl font-bold text-gray-800 text-center">
                {title}
              </h1>
            </div>
            <div className="py-4">
              <img
                className="w-full h-70 rounded-lg"
                src={image}
                alt="Recipe"
              />
            </div>
            <div className="recipebox p-4 bg-gray-100 rounded-lg overflow-y-auto max-h-96">
              <h2 className="font-score text-lg font-bold text-gray-800">
                재료
              </h2>
              <ul className="py-2 flex flex-wrap">
                {ingredients.map((ingredient, index) => (
                  <li
                    key={index}
                    className="font-score text-gray-600 mr-4 mb-2"
                  >
                    {ingredient}
                  </li>
                ))}
              </ul>
              <h2 className="font-score text-lg font-bold text-gray-800 mt-4">
                만드는 방법
              </h2>
              <ol className="list-decimal list-inside">
                {steps.map((step, index) => (
                  <li key={index} className="font-score text-gray-600">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-5 left-0 right-0 px-6">
        <div
          className="mx-auto flex justify-between"
          style={{ maxWidth: '400px' }}
        >
          <button
            className="font-score bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-8 rounded-full"
            onClick={() => navigate('/gptsearch')}
          >
            다시 할래요
          </button>
          <button
            className="font-score bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-8 rounded-full"
            onClick={handleSaveButtonClick}
          >
            저장할래요
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipePage;
