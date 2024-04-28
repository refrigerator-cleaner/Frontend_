import React from 'react';
import Logo from '../components/ui/Logo';
import { useNavigate, Link } from 'react-router-dom';

const Title = () => {
  const letters = ['냉', '장', '고', '　', '연', '금', '술', '사'];

  return (
    <div className="flex items-center justify-center">
      <h1 className="text-5xl md:text-6xl text-white font-bold">
        {letters.map((letter, index) => (
          <span
            key={index}
            className={`inline-block animate-bounce delay-${index}00 font-jua`}
            style={{ position: 'relative', top: '20px' }}
          >
            {letter}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default function GetStarted() {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-change-color flex items-center justify-center">
      <main className="text-center flex flex-col space-y-8 items-center h-full py-8">
        <Title />
        <Logo page="start" width="300px" height="300px" />
        <Link
          className="text-3xl p-5 font-bold font-jua transition ease-in-out rounded-md bg-transparent text-white hover:-translate-y-1 hover:scale-110 hover:bg-emerald hover:text-black duration-300 ..."
          onClick={() => {
            navigate('/main');
          }}
        >
          시작하기
        </Link>
      </main>
      <header className="absolute bottom-0 text-center pl-6 py-4 text-xs">
        <p>ⓒ Refrigerator-Alchemist All Copyrights Reserved.</p>
      </header>
    </section>
  );
}
