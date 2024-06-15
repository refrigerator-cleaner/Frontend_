import React, { useState, useEffect } from 'react';
import {
  GoCheckCircle,
  GoCheckCircleFill,
  GoEye,
  GoEyeClosed,
} from 'react-icons/go';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserApi } from '../context/UserContext';
import { toast } from 'react-toastify';
import InputEmail from '../components/Account/InputVeriNum';

export default function SignUp() {
  const [email, setEmail] = useState(''); // 이메일
  const [emailError, setEmailError] = useState(''); // 로그인 오류 메세지
  const [inputNum, setInputNum] = useState(''); // 입력한 인증번호
  const [nickName, setNickName] = useState(''); // 닉네임
  const [nameError, setNameError] = useState(''); // 닉네임 오류 메세지
  const [password, setPassword] = useState(''); // 비밀번호
  const [checkPassword, setCheckPassword] = useState(''); // 비밀번호 확인
  const [passwordMessage, setPasswordMessage] = useState(null); // 비밀번호 일치여부 안내 문구
  const [showPassword, setShowPassword] = useState(false); // 비밀번호 표시
  const navigate = useNavigate();
  const userApi = useUserApi();
  const emailType = 'sign-up';
  const socialType = 'Refrigerator-Alchemist';
  const location = useLocation();

  useEffect(() => {
    const socialId = localStorage.getItem('socialId');
    if (socialId) {
      toast.error('이미 로그인 상태입니다');
      navigate(-1);
    }
  }, [navigate, location]);

  /** 이메일 입력값 */
  const handleEmailChange = (e) => setEmail(e.target.value);

  /** 인증 요청
   * - userApi
   */
  const requestVerifying = async (e) => {
    e.preventDefault();
    console.log(`입력한 이메일 : ${email}`);
    const pattern =
      /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
    if (!email) {
      toast.error('이메일을 입력해주세요');
      return;
    }
    if (!pattern.test(email)) {
      setEmailError('이메일 형식이 올바르지 않습니다');
      setEmail('');
      return;
    }
    setEmailError('');
    userApi.requestEmailForSignUp(email, emailType, socialType);
  };

  /** 인증 확인
   * - userApi
   */
  const checkVerifying = (e) => {
    e.preventDefault();
    console.log(`입력한 인증번호 : ${inputNum}`);
    userApi.checkCodeVerification(email, emailType, inputNum, socialType);
  };

  /** 닉네임 중복 확인
   * - userApi
   */
  const checkDuplication = (e) => {
    e.preventDefault();
    const pattern = /^[가-힣0-9]{2,}$|^[A-Za-z0-9]{3,}$/;
    if (!pattern.test(nickName)) {
      console.log(`입력한 닉네임 : ${nickName}`);
      setNameError(
        '한글은 최소 2글자, 영문은 최소 3글자 이상 입력하세요. 숫자는 선택적으로 포함할 수 있습니다.'
      );
      setNickName('');
    } else {
      console.log(`입력한 닉네임 : ${nickName}`);
      setNameError('');
      userApi.checkNameDuplication(nickName);
    }
  };

  /** 비밀번호 유효성 검사 */
  const isPasswordValid = (password) => {
    return (
      password.length >= 8 &&
      password.length <= 15 &&
      /\d/.test(password) &&
      /[!@#$%^&*]/.test(password) &&
      /[a-zA-Z]/.test(password)
    );
  };

  /** 비밀번호 일치 확인 */
  const isSamePassword = () => {
    if (password && checkPassword) {
      password !== checkPassword
        ? setPasswordMessage(false)
        : setPasswordMessage(true);
    } else {
      setPasswordMessage(null);
    }
  };

  useEffect(() => {
    isSamePassword();
  });

  /** 비밀번호 보기 */
  const toggleShowPassword = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  /** 회원가입
   * - userApi
   */
  const onSignUp = (e) => {
    e.preventDefault();
    userApi.signUp(email, password, nickName, socialType);
  };

  return (
    <section className="flex flex-col justify-center items-center min-h-screen px-10 relative">
      {/* 뒤로가기 버튼 */}
      <div
        className="absolute top-5 left-5 border-2 w-10 h-10 transition ease-in-out delay-150 bg-main hover:bg-indigo hover:scale-125 hover:cursor-pointer hover:text-white rounded-full flex items-center justify-center"
        onClick={() => navigate('/login')}
      >
        <FaArrowLeft />
      </div>

      {/* 타이틀 */}
      <header className="flex flex-col items-center mt-10">
        <h1 className="font-score text-3xl">신규 회원가입</h1>
        <p className="font-score text-md text-gray-400 mt-2">
          환영합니다! 냉장고 연금술과 레시피 나눔을 해보세요
        </p>
      </header>

      <form onSubmit={onSignUp}>
        <main className="mt-10 w-full px-2">
          <InputEmail
            email={email}
            handleEmailChange={handleEmailChange}
            requestVerifying={requestVerifying}
            selectOption={emailError}
            inputNum={inputNum}
            setInputNum={setInputNum}
            checkVerifying={checkVerifying}
          />
        </main>

        <footer className="flex flex-col mt-6 w-full p-3">
          <div>
            {/* 닉네임 입력 */}
            <label className="mb-4 text-md font-bold font-undong text-center">
              닉네임
            </label>
            <div className="flex flex-col mb-6 justify-between">
              <div className="flex">
                <input
                  type="text"
                  value={nickName}
                  onChange={(e) => setNickName(e.target.value)}
                  placeholder="닉네임"
                  className="w-full px-4 py-3 mt-2 border-2 rounded-3xl focus:outline-none focus:ring-2 focus:ring-indigo"
                />
                {/* 중복확인 */}
                <button
                  onClick={checkDuplication}
                  className="inline-block whitespace-nowrap h-12 px-6 ml-5 mt-2 text-white bg-main rounded-3xl font-scoreExtrabold font-extrabold text-xl transition ease-in-out hover:cursor-pointer hover:scale-110 hover:bg-indigo duration-300"
                >
                  중복 확인
                </button>
              </div>
              <p
                className={`text-red-500 text-sm pl-3 mt-1 ${
                  nameError ? 'visible' : 'invisible'
                }`}
              >
                {nameError || 'empty'}
              </p>
            </div>

            {/* 비밀번호 입력 */}
            <label className="mb-4 text-md font-bold font-undong text-center">
              비밀번호
            </label>
            <div className="flex flex-col">
              <div className="flex mb-4">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호"
                  className="w-full px-4 py-3 mt-2 border-2 rounded-3xl focus:outline-none focus:ring-2 focus:ring-indigo"
                />
                <button
                  onClick={toggleShowPassword}
                  className="inline-block whitespace-nowrap h-12 ml-5 mt-2 rounded-xl font-score text-md hover:text-red-500"
                >
                  {showPassword ? <GoEye /> : <GoEyeClosed />}
                </button>
              </div>

              {/* 비밀번호 확인 */}
              <label className="flex text-md font-bold font-undong text-center">
                비밀번호 확인
              </label>
              <div className="flex">
                <input
                  type="password"
                  value={checkPassword}
                  onChange={(e) => {
                    setCheckPassword(e.target.value);
                    isSamePassword();
                  }}
                  placeholder="한 번 더 입력하세요"
                  className="w-full px-4 py-3 mt-2 border-2 rounded-3xl focus:outline-none focus:ring-2 focus:ring-indigo"
                />
              </div>
              <p
                className={`text-sm pl-3 mt-1 ${
                  passwordMessage === null
                    ? ''
                    : passwordMessage
                      ? 'text-emerald'
                      : 'text-red-500'
                }`}
              >
                {passwordMessage === null
                  ? '\u00A0'
                  : passwordMessage
                    ? '비밀번호가 일치합니다'
                    : '비밀번호가 일치하지 않습니다'}
              </p>
              <ul className="mt-4 mb-4 font-score">
                <li className="mb-2 flex items-center">
                  <span role="img" aria-label="check" className="flex">
                    {!userApi.emailExists ? (
                      <GoCheckCircleFill className="text-emerald" />
                    ) : (
                      <GoCheckCircle className="text-emerald" />
                    )}
                  </span>{' '}
                  <span className="ml-3">이메일 사용 가능</span>
                </li>
                <li className="mb-2 flex items-center">
                  <span role="img" aria-label="check" className="flex">
                    {userApi.verified ? (
                      <GoCheckCircleFill className="text-emerald" />
                    ) : (
                      <GoCheckCircle className="text-emerald" />
                    )}
                  </span>{' '}
                  <span className="ml-3">이메일 인증 완료</span>
                </li>
                <li className="mb-2 flex items-center">
                  <span role="img" aria-label="check" className="flex">
                    {!userApi.nameDuplicated ? (
                      <GoCheckCircleFill className="text-emerald" />
                    ) : (
                      <GoCheckCircle className="text-emerald" />
                    )}
                  </span>{' '}
                  <span className="ml-3">닉네임 사용 가능</span>
                </li>
                <li className="mb-2 flex items-center">
                  <span role="img" aria-label="check" className="flex">
                    {password.length >= 8 ? (
                      <GoCheckCircleFill className="text-emerald" />
                    ) : (
                      <GoCheckCircle className="text-emerald" />
                    )}
                  </span>{' '}
                  <span className="ml-3">
                    8자 이상 15자 이하의 비밀번호를 입력해주세요
                  </span>
                </li>
                <li className="mb-2 flex items-center">
                  <span role="img" aria-label="check" className="flex">
                    {isPasswordValid(password) ? (
                      <GoCheckCircleFill className="text-emerald" />
                    ) : (
                      <GoCheckCircle className="text-emerald" />
                    )}
                  </span>{' '}
                  <span className="ml-3">
                    영문, 숫자, 특수문자 각각 1자 이상을 포함해주세요
                  </span>
                </li>
              </ul>
              {/* 가입 버튼*/}
              <button
                type="submit"
                disabled={
                  userApi.emailExists === true &&
                  userApi.verified === false &&
                  userApi.nameDuplicated === true &&
                  (password.length < 8 || password.length > 15) &&
                  isPasswordValid(password) === false &&
                  !passwordMessage
                }
                className={`p-3 mx-20 mt-3 rounded-3xl font-scoreExtrabold font-extrabold text-xl transition ease-in-out duration-300
              ${
                passwordMessage
                  ? 'text-white bg-main hover:bg-emerald hover:text-black hover:cursor-pointer hover:-translate-y-1 hover:scale-110'
                  : 'bg-gray-500 text-black'
              }
              `}
              >
                가입하기
              </button>
            </div>
          </div>
        </footer>
      </form>
    </section>
  );
}
