import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 10px 10px 10px;
`;

export const Form = styled.form`
  margin-top: 20px;
  display: flex;
  justify-content: center;

  input {
    height: 55px;
    min-height: 55px;
    width: 260px;
    min-width: 260px;
    padding: 0 20px;
    background: #fff;
    font-size: 18px;
    color: #444;
    border-radius: 3px;
    transition: border 0.5s;
    border: ${props => (props.repositoryError ? '5px solid #F00' : 0)};
  }

  button {
    height: 55px;
    min-height: 55px;
    width: 65px;
    min-width: 65px;
    margin-left: 10px;
    background-color: #54e6a9;
    color: #fff;
    border: 0;
    font-size: 20px;
    font-weight: bold;
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #52d89f;
    }
  }
`;

export const EmptyFallback = styled.div`
  margin-top: 30px;
  color: rgba(255, 255, 255, 0.3);
  text-align: center;

  h1 {
    font-size: 1.8em;
    margin-bottom: 15px;
  }

  h3 {
    font-size: 1.2em;
    padding: 0 20px;
  }
`;
