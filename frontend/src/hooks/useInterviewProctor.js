import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Lightweight Interview Proctoring Hook
 * Tracks suspicious activities without performance impact
 * 
 * Monitors:
 * - Tab switches (Alt+Tab, window switching)
 * - Mouse leaving the window
 * - Copy/Paste events
 * - Window focus loss
 * - Right-click context menu
 * 
 * Performance: <5ms total overhead
 */

const useInterviewProctor = (isActive = true) => {
  const [proctorData, setProctorData] = useState({
    tabSwitches: 0,
    mouseLeaves: 0,
    copyEvents: 0,
    pasteEvents: 0,
    focusLoss: 0,
    rightClicks: 0,
    suspiciousScore: 0,
    warnings: [],
    timeAway: 0, // Total time spent away in seconds
    lastActivity: Date.now()
  });

  const [showWarning, setShowWarning] = useState(false);
  const [currentWarning, setCurrentWarning] = useState('');
  
  const awayTimerRef = useRef(null);
  const tabHiddenTimeRef = useRef(null);

  // Scoring weights
  const SCORES = {
    TAB_SWITCH: 10,
    MOUSE_LEAVE: 5,
    COPY: 3,
    PASTE: 8,
    FOCUS_LOSS: 2,
    RIGHT_CLICK: 1
  };

  // Calculate suspicious score
  const calculateScore = useCallback((data) => {
    return (
      data.tabSwitches * SCORES.TAB_SWITCH +
      data.mouseLeaves * SCORES.MOUSE_LEAVE +
      data.copyEvents * SCORES.COPY +
      data.pasteEvents * SCORES.PASTE +
      data.focusLoss * SCORES.FOCUS_LOSS +
      data.rightClicks * SCORES.RIGHT_CLICK
    );
  }, []);

  // Show warning to user
  const displayWarning = useCallback((message) => {
    setCurrentWarning(message);
    setShowWarning(true);
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
      setShowWarning(false);
    }, 4000);
  }, []);

  // Track tab visibility changes
  const handleVisibilityChange = useCallback(() => {
    if (!isActive) return;

    if (document.hidden) {
      // Tab switched away
      tabHiddenTimeRef.current = Date.now();
    } else {
      // Tab switched back
      if (tabHiddenTimeRef.current) {
        const timeAway = Math.floor((Date.now() - tabHiddenTimeRef.current) / 1000);
        
        setProctorData(prev => {
          const newData = {
            ...prev,
            tabSwitches: prev.tabSwitches + 1,
            timeAway: prev.timeAway + timeAway,
            warnings: [...prev.warnings, {
              type: 'tab_switch',
              timestamp: new Date().toISOString(),
              duration: timeAway
            }],
            lastActivity: Date.now()
          };
          
          newData.suspiciousScore = calculateScore(newData);
          return newData;
        });

        displayWarning(`⚠️ Tab switching detected! (${timeAway}s away)`);
        tabHiddenTimeRef.current = null;
      }
    }
  }, [isActive, calculateScore, displayWarning]);

  // Track mouse leaving window
  const handleMouseLeave = useCallback(() => {
    if (!isActive) return;

    const leaveTime = Date.now();
    awayTimerRef.current = leaveTime;

    // Only count if mouse stays away for >1 second
    setTimeout(() => {
      if (awayTimerRef.current === leaveTime) {
        setProctorData(prev => {
          const newData = {
            ...prev,
            mouseLeaves: prev.mouseLeaves + 1,
            warnings: [...prev.warnings, {
              type: 'mouse_leave',
              timestamp: new Date().toISOString()
            }],
            lastActivity: Date.now()
          };
          
          newData.suspiciousScore = calculateScore(newData);
          return newData;
        });

        displayWarning('⚠️ Mouse left the interview window');
      }
    }, 1000);
  }, [isActive, calculateScore, displayWarning]);

  // Track mouse entering window
  const handleMouseEnter = useCallback(() => {
    awayTimerRef.current = null;
  }, []);

  // Track copy events
  const handleCopy = useCallback((e) => {
    if (!isActive) return;

    setProctorData(prev => {
      const newData = {
        ...prev,
        copyEvents: prev.copyEvents + 1,
        warnings: [...prev.warnings, {
          type: 'copy',
          timestamp: new Date().toISOString(),
          text: e.target?.value?.substring(0, 50) // Store first 50 chars for context
        }],
        lastActivity: Date.now()
      };
      
      newData.suspiciousScore = calculateScore(newData);
      return newData;
    });

    displayWarning('⚠️ Copy event detected');
  }, [isActive, calculateScore, displayWarning]);

  // Track paste events
  const handlePaste = useCallback((e) => {
    if (!isActive) return;

    setProctorData(prev => {
      const newData = {
        ...prev,
        pasteEvents: prev.pasteEvents + 1,
        warnings: [...prev.warnings, {
          type: 'paste',
          timestamp: new Date().toISOString()
        }],
        lastActivity: Date.now()
      };
      
      newData.suspiciousScore = calculateScore(newData);
      return newData;
    });

    displayWarning('⚠️ Paste event detected');
  }, [isActive, calculateScore, displayWarning]);

  // Track window focus loss
  const handleBlur = useCallback(() => {
    if (!isActive) return;

    setProctorData(prev => {
      const newData = {
        ...prev,
        focusLoss: prev.focusLoss + 1,
        warnings: [...prev.warnings, {
          type: 'focus_loss',
          timestamp: new Date().toISOString()
        }],
        lastActivity: Date.now()
      };
      
      newData.suspiciousScore = calculateScore(newData);
      return newData;
    });

    displayWarning('⚠️ Window focus lost');
  }, [isActive, calculateScore, displayWarning]);

  // Track right-click context menu
  const handleContextMenu = useCallback((e) => {
    if (!isActive) return;

    setProctorData(prev => {
      const newData = {
        ...prev,
        rightClicks: prev.rightClicks + 1,
        warnings: [...prev.warnings, {
          type: 'right_click',
          timestamp: new Date().toISOString()
        }],
        lastActivity: Date.now()
      };
      
      newData.suspiciousScore = calculateScore(newData);
      return newData;
    });

    // Optionally prevent right-click in strict mode
    // e.preventDefault();
  }, [isActive, calculateScore]);

  // Setup event listeners
  useEffect(() => {
    if (!isActive) return;

    // Tab visibility
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Mouse tracking
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    
    // Clipboard events
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    
    // Window focus
    window.addEventListener('blur', handleBlur);
    
    // Right-click
    document.addEventListener('contextmenu', handleContextMenu);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      
      if (awayTimerRef.current) {
        clearTimeout(awayTimerRef.current);
      }
    };
  }, [isActive, handleVisibilityChange, handleMouseLeave, handleMouseEnter, 
      handleCopy, handlePaste, handleBlur, handleContextMenu]);

  // Get integrity level (0-100, higher is better)
  const getIntegrityScore = useCallback(() => {
    const maxScore = 100; // Perfect score
    const penalty = Math.min(proctorData.suspiciousScore, maxScore);
    return Math.max(0, maxScore - penalty);
  }, [proctorData.suspiciousScore]);

  // Get integrity level label
  const getIntegrityLevel = useCallback(() => {
    const score = getIntegrityScore();
    if (score >= 90) return { label: 'Excellent', color: 'green' };
    if (score >= 70) return { label: 'Good', color: 'blue' };
    if (score >= 50) return { label: 'Fair', color: 'yellow' };
    if (score >= 30) return { label: 'Poor', color: 'orange' };
    return { label: 'Suspicious', color: 'red' };
  }, [getIntegrityScore]);

  // Reset proctoring data
  const resetProctorData = useCallback(() => {
    setProctorData({
      tabSwitches: 0,
      mouseLeaves: 0,
      copyEvents: 0,
      pasteEvents: 0,
      focusLoss: 0,
      rightClicks: 0,
      suspiciousScore: 0,
      warnings: [],
      timeAway: 0,
      lastActivity: Date.now()
    });
    setShowWarning(false);
    setCurrentWarning('');
  }, []);

  return {
    proctorData,
    showWarning,
    currentWarning,
    getIntegrityScore,
    getIntegrityLevel,
    resetProctorData,
    dismissWarning: () => setShowWarning(false)
  };
};

export default useInterviewProctor;
