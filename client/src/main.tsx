import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RecoilRoot } from 'recoil'
import { Provider } from 'react-redux'
import {store} from '../src/app/redux/store'
import App from './App.tsx'
import './index.css'
/*
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RecoilRoot>
        <App />
      </RecoilRoot>
    </Provider>
  </StrictMode>,
)
  */
createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
      <RecoilRoot>
        <App />
      </RecoilRoot>
    </Provider>
)
