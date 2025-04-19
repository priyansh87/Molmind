from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from langchain_community.document_loaders import WebBaseLoader, ArxivLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_ollama import OllamaEmbeddings
from langchain_groq import ChatGroq
from langchain.chains.conversational_retrieval.base import ConversationalRetrievalChain as ConversationalRetrievalQA
from langchain_core.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv
import re
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

load_dotenv()

app = FastAPI(title="MolMind RAG API", description="API for molecular research assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

class InitChatbotRequest(BaseModel):
    user_id: str
    project_id: str
    links: List[str]

class ChatRequest(BaseModel):
    user_id: str
    project_id: str
    query: str
    chat_history: Optional[List[List[str]]] = []

class ChatResponse(BaseModel):
    answer: str
    sources: Optional[List[str]] = None

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "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")
PERSIST_DIRECTORY = os.getenv("PERSIST_DIRECTORY", "./faiss_index")

global_vectorstore = None
global_retrieval_chain = None


embeddings = OllamaEmbeddings(model="llama2")


llm = ChatGroq(
    groq_api_key=GROQ_API_KEY,
    model="llama3-8b-8192"
)

def get_loader_for_url(url: str):
    """Choose appropriate loader based on URL"""
    if "arxiv.org" in url:
        # Extract arxiv ID from URL
        arxiv_id_match = re.search(r'arxiv\.org\/abs\/([0-9.]+)', url)
        if arxiv_id_match:
            arxiv_id = arxiv_id_match.group(1)
            return ArxivLoader(query=f"id:{arxiv_id}")
    
    # Default to web loader for other URLs
    return WebBaseLoader(url)

@app.post("/init-chatbot")
async def init_chatbot(request: InitChatbotRequest):
    global global_vectorstore
    
    try:
        # Process each link
        documents = []
        for link in request.links:
            loader = get_loader_for_url(link)
            docs = loader.load()
            
            # Add metadata to each document
            for doc in docs:
                doc.metadata["user_id"] = request.user_id
                doc.metadata["project_id"] = request.project_id
                doc.metadata["source"] = link
            
            documents.extend(docs)
        
       
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        split_docs = text_splitter.split_documents(documents)
        
        
        if global_vectorstore is None:
            global_vectorstore = FAISS.from_documents(split_docs, embeddings)
        else:
            global_vectorstore.add_documents(split_docs)
   
        global_vectorstore.save_local(PERSIST_DIRECTORY)
        
        return {"status": "success", "message": f"Processed {len(documents)} documents with {len(split_docs)} chunks"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error initializing chatbot: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    global global_vectorstore
    
    if global_vectorstore is None:
        
        try:
            global_vectorstore = FAISS.load_local(PERSIST_DIRECTORY, embeddings)
        except:
            raise HTTPException(status_code=500, detail="No vector store initialized. Please initialize the chatbot first.")
    
    try:
        
        retriever = global_vectorstore.as_retriever(
            search_kwargs={
                "filter": {"user_id": request.user_id, "project_id": request.project_id},
                "k": 5  # Number of documents to retrieve
            }
        )
        
        # Create prompt template
        prompt = ChatPromptTemplate.from_template("""
        You are a professional AI molecular research assistant. Based on the user's query and the provided context, provide a helpful and accurate response.
        
        Your goals:
        1. Understand the user's molecular research question or concern.
        2. Provide scientifically accurate information based on the context.
        3. If the information is not found in the context, clearly state that.
        4. Be concise and professional in your responses.
        5. Never make up scientific data that isn't supported by the context.
        
        <context>
        {context}
        </context>
        
        Chat History: {chat_history}
        User Query: {question}
        
        Your Response:
        """)
        
        # Create RAG chain
        qa_chain = ConversationalRetrievalQA.from_llm(
            llm=llm,
            retriever=retriever,
            return_source_documents=True,
            combine_docs_chain_kwargs={"prompt": prompt}
        )
        
        # Generate response
        result = qa_chain.invoke({
            "question": request.query,
            "chat_history": request.chat_history
        })
        
        # Extract sources for citation
        sources = []
        if hasattr(result, "source_documents"):
            sources = list(set([doc.metadata.get("source", "") for doc in result.source_documents]))
        
        return {
            "answer": result["answer"],
            "sources": sources
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "vectorstore_initialized": global_vectorstore is not None}

@app.post("/refresh-data")
async def refresh_data():
    global global_vectorstore
    
    try:
        # Just clear the vector store without deleting the files
        global_vectorstore = None
        return {"status": "success", "message": "Vector store cleared. Ready for new initialization."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refreshing data: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)