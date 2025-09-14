import { useEffect, useState } from "react";
import { TextNode } from "../../utils/tts";
import Button from './Button';
import { Play, Pause, Loader2, BadgeCheck } from 'lucide-react';

export const DiscussionMessageCard = ({ node, currentNode, handlePlay, handlePause }: { 
  node: TextNode, 
  currentNode: TextNode | null,
  handlePlay: (node: TextNode)=>void,
  handlePause: (node: TextNode)=>void,
}) =>{
    const isCurrent = currentNode?.id == node?.id

    const [nodeState, setNodeState] = useState<TextNode>(node)

    useEffect(()=>{
      if(isCurrent){
        setNodeState(currentNode)
      }
    }, [currentNode])
    
    function getIcon() {
      console.log('Getting Icon for Node:', nodeState)
      if(isCurrent && nodeState.loading && !nodeState.playing){
        return <Loader2 className="h-3 w-3 animate-spin text-primary-500" />
      }

       if( isCurrent && nodeState.playing) {
        console.log('return playing...')
          return <Pause className="h-3 w-3 text-green-600" onClick={async()=>{
                    handlePause(node)
                  }} />
      } 
        
      if(!nodeState.playing && nodeState.played ){
       return <Play onClick={
          async()=>{
            handlePlay(node)
        }
      } className={`h-3 w-3 text-gray-600`} /> 
      }
        
      return <Play onClick={
          async()=>{
          handlePlay(node)
        }
      } className={`h-3 w-3 text-blue-600`} />
    }

    return <div className="flex-1 max-w-md">
    <div className={`rounded-lg p-3 ${
      node?.persona?.isUser
        ? 'bg-primary-500 text-white'
        : node?.persona?.role === 'teacher'
        ? 'bg-gray-100'
        : 'bg-secondary-50' }`}>
      <div className="flex items-center mb-1">
        <span className={`text-xs font-medium ${
          node?.persona?.isUser ? 'text-primary-100' : 'text-gray-600'
        }`}>
          {node?.persona?.name}
        </span>
        {node.persona.role == 'teacher' && <BadgeCheck className="ml-2 text-purple-600" fontSize={'14px'} width={'14px'} height={'14px'} />}
      </div>
      <p className="text-sm leading-relaxed">{node?.text}</p>
    </div>
    
    
    {
        <Button
        variant="ghost"
        size="sm"
        onClick={()=>{
            if(nodeState.loading)return
        }}
        disabled={nodeState.loading}
        className="w-6 h-6 p-0 rounded-full hover:bg-gray-100 flex items-center justify-center focus:border-none"
        icon={
           getIcon()
        }
        />
}
    
    
    <p className={`text-xs mt-1 ${
      node?.persona?.isUser ? 'text-right text-gray-400' : 'text-gray-500'
    }`}>
      {node.timestamp.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}
    </p>
  </div>
        }
