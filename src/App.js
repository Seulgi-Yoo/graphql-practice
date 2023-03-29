import "./App.css";
import { graphql } from "@octokit/graphql";
import { useEffect, useState } from "react";
import styled from "styled-components"
const token = process.env.REACT_APP_CLIENT_TOKEN;


const QuestionsList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 80vh;
  overflow: auto;
  margin-top: 20px;
  li {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-bottom: 5px;
    font-size: 16px;
    max-width: 500px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    .title_and_author {
      @media screen and (max-width: 500px){
        max-width: 350px;
      }
      width: 350px;
      display: flex;
      flex-direction: column;
      >span {
        color: #5A88CE;
      }
    }
    .author_avatar {
      @media screen and (max-width: 500px){
        display: none;
      }
    }
    .createdAt {
      @media screen and (max-width: 500px){
        display: none;
      }
    }
    img {
      width: 40px;
      height: 40px;
      margin-right: 20px;
      border-radius: 40px;
      border: .5px solid rgba(0,0,0,0.3);
    }
    a {
      text-decoration: none;
      color: #000;
      font-weight: 700;
      text-align: start;
      &:hover {
        text-decoration: underline;
      }
    }
    .author {
      font-size: 14px;
      font-weight: 400;
    }
    .createdAt {
      font-size: 14px;
      border: 2px solid #ccc;
      border-radius: 5px;
      min-width: 100px;
      align-self: center;
      text-align: center;
      margin-left: 10px;
    }
    button {
      border: none;
      background: none;
      margin-left: 10px;
      cursor: pointer;
    }
    .toggle_bg {
      &.opened{
        background-color: rgba(30, 30, 30, 0.1);
        z-index: -1;
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
      }
    }
    .body {
      display: none;
      margin-top: 10px;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
      max-width: 500px;
      position: absolute;
      background-color: #fff;
      top: 80px;
      z-index: 1;
      &.opened {
        display: block;
      }
      &.closed {
        display: none;
      }
    }
  }
  `

function App() {
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [openedIdx, setOpenedIdx] = useState(-1); // 처음엔 아무것도 띄우지 않기 위해 초기값 -1 설정
  

  async function repo() {
    const { repository } = await graphql(
      `
      query MyQuery {
          repository(owner: "codestates-seb", name: "agora-states-fe") {
            discussions(first: 10) {
              edges {
                node {
                  title
                  url
                  createdAt
                  author {
                    avatarUrl
                    resourcePath
                    url
                  }
                  bodyText
                  category {
                    name
                  }
                }
              }
            }
          }
        }
      `,
      {
        headers: {
          authorization: `token ${token}`,
        },
      }
    );
    return repository;
  }

  useEffect(() => {
    repo()
    .then(res => {
      setData(res.discussions.edges)
      setIsLoading(false)
    })
    .catch(err => {
      console.log(err)
    })
  }, [])

  function handleToggle(idx) {
    if(openedIdx == idx) {
      setOpenedIdx(-1); // 열린 항목 클릭 시 다시 닫기
    }
    else {
      setOpenedIdx(idx) // 새로운 항목을 클릭한 경우, 해당 항목 열기
    }
  }
  return (
    <div className="App">
      <h1>Agora States</h1>
      <QuestionsList>
        {isLoading? "loading..." : data.map((item, idx) => {
          return <li key = {idx}>
            <div className="author_avatar">
              <img src={item.node.author.avatarUrl} alt={`${item.node.author.resourcePath}'s avatar`} />
            </div>
            <div className="title_and_author">
              <span>{`[${item.node.category.name}]`}</span>
              <a href={item.node.url} target='_blank'>{item.node.title}</a>
              <a href={item.node.author.url} target='_blank' className="author">{item.node.author.resourcePath}</a>
            </div>
            <div className="createdAt">{new Date(item.node.createdAt).toLocaleDateString()}</div>
            <button onClick={() => handleToggle(idx)}>{`${openedIdx === idx ? '△' : '▽'}`}</button>
            <div className={`toggle_bg ${openedIdx === idx ? 'opened' : 'closed'}`}></div>
            <div className={`body ${openedIdx === idx ? 'opened' : 'closed'}`}>{item.node.bodyText}</div>
          </li>
        })}
      </QuestionsList>
    </div>
  );
}

export default App;
