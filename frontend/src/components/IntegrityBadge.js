import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

/**
 * IntegrityBadge Component
 * Displays interview integrity score and suspicious activity details
 */
const IntegrityBadge = ({ proctorData, compact = false }) => {
  if (!proctorData) {
    return null;
  }

  // Calculate integrity score
  const calculateIntegrityScore = () => {
    const SCORES = {
      TAB_SWITCH: 10,
      MOUSE_LEAVE: 5,
      COPY: 3,
      PASTE: 8,
      FOCUS_LOSS: 2,
      RIGHT_CLICK: 1
    };

    const suspiciousScore = (
      (proctorData.tabSwitches || 0) * SCORES.TAB_SWITCH +
      (proctorData.mouseLeaves || 0) * SCORES.MOUSE_LEAVE +
      (proctorData.copyEvents || 0) * SCORES.COPY +
      (proctorData.pasteEvents || 0) * SCORES.PASTE +
      (proctorData.focusLoss || 0) * SCORES.FOCUS_LOSS +
      (proctorData.rightClicks || 0) * SCORES.RIGHT_CLICK
    );

    const maxScore = 100;
    const penalty = Math.min(suspiciousScore, maxScore);
    return Math.max(0, maxScore - penalty);
  };

  const getIntegrityLevel = (score) => {
    if (score >= 90) return { label: 'Excellent', color: 'green', icon: CheckCircle };
    if (score >= 70) return { label: 'Good', color: 'blue', icon: Shield };
    if (score >= 50) return { label: 'Fair', color: 'yellow', icon: AlertTriangle };
    if (score >= 30) return { label: 'Poor', color: 'orange', icon: AlertTriangle };
    return { label: 'Suspicious', color: 'red', icon: XCircle };
  };

  const integrityScore = calculateIntegrityScore();
  const level = getIntegrityLevel(integrityScore);
  const Icon = level.icon;

  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      badge: 'bg-green-100'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      badge: 'bg-blue-100'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      badge: 'bg-yellow-100'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
      badge: 'bg-orange-100'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      badge: 'bg-red-100'
    }
  };

  const colors = colorClasses[level.color];

  if (compact) {
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${colors.badge} ${colors.text}`}>
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">
          Integrity: {level.label} ({integrityScore}%)
        </span>
      </div>
    );
  }

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`${colors.badge} p-2 rounded-lg`}>
            <Icon className={`h-6 w-6 ${colors.text}`} />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${colors.text}`}>
              Interview Integrity: {level.label}
            </h3>
            <p className="text-sm text-gray-600">
              Score: {integrityScore}/100
            </p>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {proctorData.tabSwitches > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500">Tab Switches</p>
            <p className={`text-lg font-semibold ${colors.text}`}>
              {proctorData.tabSwitches}
            </p>
          </div>
        )}
        
        {proctorData.mouseLeaves > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500">Mouse Leaves</p>
            <p className={`text-lg font-semibold ${colors.text}`}>
              {proctorData.mouseLeaves}
            </p>
          </div>
        )}
        
        {proctorData.copyEvents > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500">Copy Events</p>
            <p className={`text-lg font-semibold ${colors.text}`}>
              {proctorData.copyEvents}
            </p>
          </div>
        )}
        
        {proctorData.pasteEvents > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500">Paste Events</p>
            <p className={`text-lg font-semibold ${colors.text}`}>
              {proctorData.pasteEvents}
            </p>
          </div>
        )}
        
        {proctorData.focusLoss > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500">Focus Loss</p>
            <p className={`text-lg font-semibold ${colors.text}`}>
              {proctorData.focusLoss}
            </p>
          </div>
        )}
        
        {proctorData.timeAway > 0 && (
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500">Time Away</p>
            <p className={`text-lg font-semibold ${colors.text}`}>
              {proctorData.timeAway}s
            </p>
          </div>
        )}
      </div>

      {/* Explanation */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          {integrityScore >= 90 && "Excellent integrity! No suspicious activity detected during the interview."}
          {integrityScore >= 70 && integrityScore < 90 && "Good integrity with minimal suspicious activity."}
          {integrityScore >= 50 && integrityScore < 70 && "Fair integrity. Some suspicious activity was detected."}
          {integrityScore >= 30 && integrityScore < 50 && "Poor integrity. Multiple suspicious activities detected."}
          {integrityScore < 30 && "Suspicious activity detected. Interview integrity is questionable."}
        </p>
      </div>
    </div>
  );
};

export default IntegrityBadge;
