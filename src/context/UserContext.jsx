import React, { useState, useReducer, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ErrorCode from '../components/ErrorCode';

// 📀 토큰 처리
const instance = axios.create({
  baseURL: 'http://localhost:8080/auth',
});

// ❕ 요청 인터셉터 : 토큰 업데이트
instance.interceptors.request.use(
  function (config) {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (accessToken) {
      config.headers['Authorization-Access'] = 'Bearer ' + accessToken;
    }
    if (refreshToken) {
      config.headers['Authorization-Refresh'] = 'Bearer ' + refreshToken;
    }
    return config;
  },

  function (error) {
    return Promise.reject(error);
  }
);

// ❕ 유저 상태 초기화
const initialState = {
  user: null,
};

// ❕ 액션 타입
const SET_USER = 'SET_USER';

// ❕ Reducer : state에 유저 상태 저장
const reducer = (state, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        user: action.user, // ▶ 유저의 액션
      };
    default:
      throw new Error(`통제되지 않는 타입: ${action.type}`);
  }
};

// ❕ Context 정의
const UserStateContext = createContext();
const UserDispatchContext = createContext();

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState); // 유저 상태 공유

  const [emailExists, setEmailExists] = useState(true); // 회원가입 시 이메일 중복 여부

  const [takenTime, setTakenTime] = useState(null); // 인증번호 발급시간
  const [expireTime, setExpireTime] = useState(null);

  const [verified, setVerified] = useState(false); // 이메일 인증 여부

  const [nameDuplicated, setNameDuplicated] = useState(true); // 닉네임 중복 여부

  // 🙍‍♂️🙍‍♀️ SNS 로그인 엔드 포인트
  const googleURL = `http://localhost:8080/oauth2/authorization/google`;
  const kakaoURL = `http://localhost:8080/oauth2/authorization/kakao`;
  const naverURL = `http://localhost:8080/oauth2/authorization/naver`;

  const navigate = useNavigate();

  // 📧 이메일 인증 요청 (회원가입용) -------------------------------------------------
  const requestEmailForSignUp = async (email, emailType, socialType) => {
    const URL = 'http://localhost:8080/auth/send-email';

    try {
      const response = await instance.post(URL, {
        email,
        emailType,
        socialType,
      });

      console.log('리스폰스', response);

      // ▶ 204 === 중복 아니고, 인증발급
      if (response.status === 204) {
        setEmailExists(false);
        setTakenTime(new Date());
        window.alert('인증번호가 발송되었습니다');
      } else {
        setEmailExists(true);
        window.alert('이미 서버에 존재하는 이메일입니다');
      }
    } catch (error) {
      console.error('이메일 인증번호 요청 중 에러 발생: ', error);
    }
  };

  // 📧 이메일 인증 요청 (비밀번호 재설정용) ---------------------------------------------
  const requestEmailForReset = async (email, emailType, socialType) => {
    const URL = 'http://localhost:8080/auth/send-email';

    try {
      const response = await instance.post(URL, {
        email,
        emailType,
        socialType,
      });

      console.log('리스폰스', response);

      // ▶ 204 === 중복이고, 인증 발급
      if (response.status === 204) {
        setEmailExists(true);
        setTakenTime(new Date());
        setExpireTime(
          new Date(new Date().setMinutes(new Date().getMinutes() + 10))
        );
        window.alert('인증번호가 발송되었습니다');
      } else {
        setEmailExists(false);
        window.alert('존재하지 않는 이메일입니다');
      }
    } catch (error) {
      console.error('이메일 인증번호 요청 중 에러 발생: ', error);
    }
  };

  // ✅ 이메일 인증 확인 ------------------------------------------------------------
  const checkCodeVerification = async (
    email,
    emailType,
    inputNum,
    socialType
  ) => {
    const NO_CODE_ERROR = '인증번호를 입력해주세요';
    const EXPIRED_CODE_ERROR = '인증번호가 만료되었습니다';

    // ▶ 인증번호 입력 여부 확인
    if (!inputNum) {
      window.alert(NO_CODE_ERROR);
      return;
    }

    // ▶ 인증 유효 시간 10분
    const timeDifference = (expireTime - takenTime) / 1000 / 60;

    if (timeDifference > 10) {
      window.alert(EXPIRED_CODE_ERROR);
      return;
    }

    try {
      const response = await instance.post(
        'http://localhost:8080/auth/verify-email',
        {
          email,
          emailType,
          inputNum,
          socialType,
          // randomNum,
          // takenTime,
          // expireTime,
        }
      );

      if (response.status === 204) {
        setVerified(true);
        window.alert('인증 완료!');
      } else {
        window.alert('인증 실패;');
      }
    } catch (error) {
      console.error('인증 완료 상태 전송 중 에러 발생: ', error);
    }
  };

  // ❓ 닉네임 중복 확인
  const checkNameDuplication = async (nickName) => {
    try {
      const response = await instance.post(
        'http://localhost:8080/auth/verify-nickname',
        {
          nickName,
        }
      );

      if (response.data.isDuplicated) {
        setNameDuplicated(true);
        window.alert('이미 존재하는 닉네임입니다');
      } else {
        setNameDuplicated(false);
        window.alert('사용가능한 닉네임입니다:)');
      }
    } catch (error) {
      console.error('닉네임 중복 확인 중 에러 발생: ', error);
    }
  };

  // 📝 회원가입 ---------------------------------------------------------------
  const signup = (email, password, nickName, socialType) => {
    const URL = 'http://localhost:8080/auth/signup';

    instance
      .post(
        URL,
        {
          email: email,
          password: password,
          nickName: nickName,
          socialType: socialType,
        },
        {
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            Accept: 'application/json',
          },
        }
      )
      .then((result) => {
        console.log(`회원가입 요청 성공 : ${result}`);
        window.alert('회원가입이 완료되었습니다!');
        navigate('/login');
      })
      .catch((error) => {
        console.log(error);
        window.alert('회원가입이 정상적으로 완료되지 못했습니다;');
      });
  };

  // 🚫 회원탈퇴 ---------------------------------------------------------------
  const deleteUser = async () => {
    const URL = 'http://localhost:8080/auth/delete-user';
    const socialId = localStorage.getItem('socialId');

    try {
      await instance.delete(URL, {
        data: { socialId },
      });

      // ▶ 로그아웃 처리
      logout();

      window.alert('회원탈퇴가 완료되었습니다.');
    } catch (error) {
      console.error('회원탈퇴 요청 중 에러 발생: ', error);
    }
  };

  // 🔐 로그인 ---------------------------------------------------------------
  const login = (email, password, socialType) => {
    const URL = 'http://localhost:8080/auth/token/login';

    instance
      .post(
        URL,
        {
          email: email,
          password: password,
          socialType: socialType,
        },
        {
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            Accept: 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
      .then((response) => {
        console.log('로그인 되었습니다!');

        localStorage.setItem(
          'accessToken',
          response.headers['authorization-access']
        );
        localStorage.setItem(
          'refreshToken',
          response.headers['authorization-refresh']
        );
        localStorage.setItem('socialId', response.headers.get('socialId'));
        localStorage.setItem('nickName', response.data.name);
        localStorage.setItem('email', response.data.email);
        localStorage.setItem('socialType', response.data.socialType);

        // ▶ 유저 데이터 저장
        let user = {
          socialId: response.headers['socialId'],
          nickName: response.data.name,
          email: response.data.email,
          password,
          socialType: socialType,
        };

        dispatch({ type: SET_USER, user });
        window.alert('로그인 되었습니다!');
        navigate('/main');
      })
      .catch((error) => {
        // 에러 상태 코드에 따른 메시지 표시
        if (error.response && error.response.status) {
          switch (error.response.status) {
            case ErrorCode.NOT_EXIST_USER_EMAIL_SOCIALTYPE.status:
              window.alert(ErrorCode.NOT_EXIST_USER_EMAIL_SOCIALTYPE.message);
              break;
            case ErrorCode.NOT_VALID_ACCESSTOKEN.status:
              window.alert(ErrorCode.NOT_VALID_ACCESSTOKEN.message);
              break;
            default:
              window.alert('로그인 실패!');
          }
        } else {
          window.alert('로그인 실패!');
        }
      });
  };

  //🔓 로그아웃 ---------------------------------------------------------------
  const logout = async () => {
    const URL = 'http://localhost:8080/auth/token/logout';
    const socialId = localStorage.getItem('socialId');
    // const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await instance.post(
        URL,
        { socialId },
        {
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            Accept: 'application/json',
            'Access-Control-Allow-Origin': '*',
            // 'authorization-access': accessToken,
          },
        }
      );

      if (response.status === 204) {
        console.log(response.status);

        // ▶ 유저 데이터 삭제
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('socialid');
        localStorage.removeItem('nickName');
        localStorage.removeItem('email');
        localStorage.removeItem('socialType');

        // ▶ 유저 상태 초기화
        dispatch({ type: SET_USER, user: null });

        // ▶ 유저 상태 초기화
        window.alert('로그아웃 되었습니다!');

        // ▶ Redirect
        navigate('/main');
      }
    } catch (error) {
      console.log(error);
      window.alert('💥 로그아웃에 문제가 생겼습니다!');
    }
  };

  // 🔄 비밀번호 재설정 ---------------------------------------------------------------
  const resetPassword = async (email, password, rePassword, socialType) => {
    try {
      const response = await instance.post(
        'http://localhost:8080/auth/reset-password',
        {
          email,
          password,
          rePassword,
          socialType,
        }
      );

      if (response.status === 204) {
        window.alert('비밀번호가 성공적으로 재설정되었습니다');
      } else {
        window.alert('비밀번호 재설정에 실패하였습니다');
      }
    } catch (error) {
      console.error('비밀번호 재설정 중 에러 발생: ', error);
    }

    navigate('/login');
  };

  // 🚀 새로운 액세스 토큰 발급 -----------------------------------------------------------
  const sendRefresh = async () => {
    const URL = 'http://localhost:8080/auth/token/reissue';
    const socialId = localStorage.getItem('socialId');
    // const refreshToken = localStorage.getItem('refreshToken');

    try {
      const response = await instance.post(
        URL,
        { socialId }
        // {
        // headers: {
        // 'authorization-refresh': refreshToken,
        // },
        // }
      );

      if (response.status === 204) {
        localStorage.setItem('accessToken', response.data.accessToken);
        console.log(
          `새로운 액세스 토큰을 발급받았습니다 : ${response.data.accessToken}`
        );
        navigate(window.location.pathname);
      }
    } catch (error) {
      console.error(error);
      window.alert('새로운 액세스 토큰 발급 실패');
    }
  };

  // 🟡 카카오 --------------------------------------------------
  const kakaoLogin = () => {
    window.location.href = kakaoURL;
    console.log('카카오 로그인 페이지 접속');
  };

  // 🔴 구글 ----------------------------------------------------
  const googleLogin = () => {
    window.location.href = googleURL;
    console.log('구글 로그인 페이지 접속');
  };

  // 🟢 네이버 --------------------------------------------------
  const naverLogin = () => {
    window.location.href = naverURL;
    console.log('네이버 로그인 페이지 접속');
  };

  // ❤ Dispatch에 담길 value
  const value = {
    state,
    dispatch,
    login,
    logout,
    signup,
    deleteUser,
    resetPassword,
    requestEmailForSignUp,
    requestEmailForReset,
    setEmailExists,
    emailExists,
    checkCodeVerification,
    verified,
    setVerified,
    checkNameDuplication,
    nameDuplicated,
    setNameDuplicated,
    sendRefresh,
    kakaoLogin,
    googleLogin,
    naverLogin,
  };

  return (
    <UserDispatchContext.Provider value={value}>
      <UserStateContext.Provider value={state}>
        {children}
      </UserStateContext.Provider>
    </UserDispatchContext.Provider>
  );
};

// 🔱 UserState을 사용 가능하게 하는 훅
export const useUserState = () => {
  const context = useContext(UserStateContext);
  if (!context) {
    throw new Error('Cannot find UserProvider');
  }
  return context;
};

// 🔱 UserDispatch를 사용 가능하게 하는 훅
export const useUserDispatch = () => {
  const context = useContext(UserDispatchContext);
  if (!context) {
    throw new Error('Cannot find UserProvider');
  }
  return context;
};
