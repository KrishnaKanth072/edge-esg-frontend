import { motion } from 'framer-motion';
import { Agent } from '@/lib/types';

interface AgentAvatarProps {
  agent: Agent;
  index: number;
}

export default function AgentAvatar({ agent, index }: AgentAvatarProps) {
  const isActive = agent.status === 'analyzing';
  const isComplete = agent.status === 'complete';

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="flex flex-col items-center gap-2"
    >
      <motion.div
        animate={isActive ? {
          scale: [1, 1.2, 1],
          boxShadow: [
            '0 0 20px rgba(59, 130, 246, 0.5)',
            '0 0 40px rgba(59, 130, 246, 0.8)',
            '0 0 20px rgba(59, 130, 246, 0.5)',
          ],
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        className={`
          w-16 h-16 rounded-full flex items-center justify-center text-3xl
          ${isActive ? 'glass-card pulse-glow' : 'glass'}
          ${isComplete ? 'bg-green-500/20' : ''}
        `}
      >
        {agent.icon}
      </motion.div>
      <div className="text-center">
        <p className="text-xs text-white/80">{agent.name}</p>
        {isActive && (
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xs text-blue-400"
          >
            {agent.progress}%
          </motion.p>
        )}
        {isComplete && (
          <p className="text-xs text-green-400">✓ Complete</p>
        )}
      </div>
    </motion.div>
  );
}
