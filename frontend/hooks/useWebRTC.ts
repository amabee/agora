import { useEffect, useRef, useState, useCallback } from 'react';
import SimplePeer from 'simple-peer';

interface Peer {
  peerId: string;
  peer: SimplePeer.Instance;
  stream?: MediaStream;
}

interface UseWebRTCProps {
  roomId: string;
  userId: string;
  username: string;
  sendSignal: (signal: any) => void;
  onSignal?: (data: any) => void;
  enabled?: boolean;
}

export function useWebRTC({
  roomId,
  userId,
  username,
  sendSignal,
  onSignal,
  enabled = true,
}: UseWebRTCProps) {
  const [peers, setPeers] = useState<Map<string, Peer>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const peersRef = useRef<Map<string, Peer>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);

  // Get user media (camera + microphone)
  const startLocalStream = useCallback(async () => {
    console.log('🎥 Attempting to start local stream...');
    try {
      console.log('🎥 Requesting getUserMedia...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      console.log('✅ getUserMedia successful, stream:', stream);
      console.log('📹 Video tracks:', stream.getVideoTracks().length);
      console.log('🎤 Audio tracks:', stream.getAudioTracks().length);

      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsCameraOn(true);
      setIsMicOn(true);
      
      console.log('📹 Local stream started and state updated');
      return stream;
    } catch (error: any) {
      console.error('❌ Failed to get user media:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      if (error.name === 'NotAllowedError') {
        console.error('❌ Camera/microphone permission denied by user');
      } else if (error.name === 'NotFoundError') {
        console.error('❌ No camera/microphone found');
      } else if (error.name === 'NotReadableError') {
        console.error('❌ Camera/microphone is already in use');
      }
      return null;
    }
  }, []);

  // Stop local stream
  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
      setIsCameraOn(false);
      setIsMicOn(false);
    }
  }, []);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  }, []);

  // Toggle microphone
  const toggleMic = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  }, []);

  // Create peer connection
  const createPeer = useCallback((peerId: string, initiator: boolean, stream: MediaStream) => {
    const peer = new SimplePeer({
      initiator,
      trickle: true,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    });

    peer.on('signal', (signal) => {
      console.log(`📤 Sending signal to ${peerId}`, signal.type);
      sendSignal({
        type: 'webrtc-signal',
        to: peerId,
        from: userId,
        signal,
      });
    });

    peer.on('stream', (remoteStream) => {
      console.log(`📥 Received stream from ${peerId}`);
      setPeers(prev => {
        const newPeers = new Map(prev);
        const existingPeer = newPeers.get(peerId);
        if (existingPeer) {
          newPeers.set(peerId, { ...existingPeer, stream: remoteStream });
        }
        return newPeers;
      });
      
      peersRef.current.set(peerId, {
        peerId,
        peer,
        stream: remoteStream,
      });
    });

    peer.on('error', (err) => {
      console.error(`❌ Peer error with ${peerId}:`, err);
    });

    peer.on('close', () => {
      console.log(`🔌 Peer connection closed with ${peerId}`);
      setPeers(prev => {
        const newPeers = new Map(prev);
        newPeers.delete(peerId);
        return newPeers;
      });
      peersRef.current.delete(peerId);
    });

    const peerData: Peer = { peerId, peer };
    peersRef.current.set(peerId, peerData);
    setPeers(prev => new Map(prev).set(peerId, peerData));

    return peer;
  }, [userId, sendSignal]);

  // Add peer (when someone joins)
  const addPeer = useCallback((peerId: string) => {
    if (!localStreamRef.current) {
      console.warn('No local stream available');
      return;
    }

    if (peersRef.current.has(peerId)) {
      console.log(`Peer ${peerId} already exists`);
      return;
    }

    console.log(`➕ Adding peer: ${peerId} (as initiator)`);
    createPeer(peerId, true, localStreamRef.current);
  }, [createPeer]);

  // Handle incoming signal
  const handleSignal = useCallback((data: { from: string; signal: any }) => {
    const { from, signal } = data;

    let peer = peersRef.current.get(from)?.peer;

    if (!peer && localStreamRef.current) {
      // Create new peer if doesn't exist
      console.log(`➕ Creating peer for incoming signal from ${from}`);
      peer = createPeer(from, false, localStreamRef.current);
    }

    if (peer) {
      try {
        console.log(`📨 Processing signal from ${from}`, signal.type);
        peer.signal(signal);
      } catch (error) {
        console.error(`Failed to process signal from ${from}:`, error);
      }
    }
  }, [createPeer]);

  // Remove peer (when someone leaves)
  const removePeer = useCallback((peerId: string) => {
    const peerData = peersRef.current.get(peerId);
    if (peerData) {
      console.log(`➖ Removing peer: ${peerId}`);
      peerData.peer.destroy();
      peersRef.current.delete(peerId);
      setPeers(prev => {
        const newPeers = new Map(prev);
        newPeers.delete(peerId);
        return newPeers;
      });
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Destroy all peers
      peersRef.current.forEach(({ peer }) => peer.destroy());
      peersRef.current.clear();
      
      // Stop local stream
      stopLocalStream();
    };
  }, [stopLocalStream]);

  // Set up signal handler
  useEffect(() => {
    if (onSignal) {
      onSignal(handleSignal);
    }
  }, [onSignal, handleSignal]);

  return {
    localStream,
    peers: Array.from(peers.values()),
    isCameraOn,
    isMicOn,
    isScreenSharing,
    startLocalStream,
    stopLocalStream,
    toggleCamera,
    toggleMic,
    addPeer,
    removePeer,
    handleSignal,
  };
}
