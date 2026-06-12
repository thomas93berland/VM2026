import { defaultState } from "./defaultState.js";

const STORAGE_KEY = "vm-lounge-2026-structured-v1";

export function loadState(){
  try{
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : structuredClone(defaultState);
  }catch{
    return structuredClone(defaultState);
  }
}

export function saveState(state){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState(){
  localStorage.removeItem(STORAGE_KEY);
  return structuredClone(defaultState);
}
