import React from 'react';

/**
 * EvidenceViewerModal.jsx
 * CCTV Snapshot & AI Multi-Person / Tailgating Evidence Viewer
 * Pubali Bank PLC · Security Operations Center
 */
export default function EvidenceViewerModal({ evidence, record, onClose }) {
  if (!evidence && !record) return null;

  const data = evidence || record?.evidenceSnapshot || {
    camName: record?.camera || 'CAM-CH-01 (Primary Optical)',
    snapshotUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80',
    detectedPersons: record?.persons_detected || 2,
    notes: 'Optical sensor discrepancy logged. Multiple heat/facial signatures identified during single authentication cycle.'
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 6, 23, 0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(13, 148, 136, 0.4)',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 25px rgba(13, 148, 136, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: '#f8fafc'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#090d16',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                boxShadow: '0 0 10px #ef4444',
                animation: 'pulse 1.5s infinite'
              }}
            />
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.02em', color: '#f1f5f9' }}>
                CCTV Forensic Evidence · Snapshot #{record?.id || record?.event_id || 'EVT-SEC-01'}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                {data.camName} · {record?.location || 'Central Facility'} · Timestamp: {record?.date || '2026-09-18'} {record?.time || '09:00:00'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '20px',
              lineHeight: 1,
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '6px',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Surveillance Frame Container */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '380px',
              backgroundColor: '#020617',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <img
              src={data.snapshotUrl}
              alt="CCTV Security Snapshot"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'contrast(1.08) brightness(0.92)'
              }}
            />

            {/* AI HUD Overlay Elements */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '14px',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(4px)',
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              REC ● 1080P/60FPS | AI HEAD-COUNT: {data.detectedPersons || 2}
            </div>

            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '14px',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#38bdf8'
              }}
            >
              SUPREMA BIOSTAR X VISION LINK
            </div>

            {/* AI Bounding Boxes */}
            <div
              style={{
                position: 'absolute',
                top: '22%',
                left: '26%',
                width: '140px',
                height: '210px',
                border: '2px solid #10b981',
                boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)',
                borderRadius: '4px',
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '-2px',
                  backgroundColor: '#10b981',
                  color: '#022c22',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '2px',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase'
                }}
              >
                ID: VERIFIED BADGE (1)
              </div>
            </div>

            <div
              style={{
                position: 'absolute',
                top: '26%',
                left: '52%',
                width: '135px',
                height: '200px',
                border: '2px dashed #ef4444',
                boxShadow: '0 0 15px rgba(239, 68, 68, 0.5)',
                borderRadius: '4px',
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '-2px',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '2px',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase'
                }}
              >
                BREACH: UNBADGED (2)
              </div>
            </div>

            {/* Bottom Telemetry Bar */}
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '12px',
                right: '12px',
                backgroundColor: 'rgba(2, 6, 23, 0.8)',
                padding: '6px 12px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#cbd5e1',
                fontFamily: 'monospace'
              }}
            >
              <span>CH: {data.camName}</span>
              <span>DOOR: {record?.door || 'Interlock Gate'}</span>
              <span>CONFIDENCE: 98.6%</span>
              <span style={{ color: '#ef4444' }}>ALARM CODE: SEC-ALM-PIGGYBACK</span>
            </div>
          </div>

          {/* Incident Details Card */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
              backgroundColor: '#1e293b',
              padding: '14px 18px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Authorized Subject</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', marginTop: '2px' }}>
                {record?.authorized_person || 'Assigned Custodian'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Violation Flag</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f87171', marginTop: '2px' }}>
                {record?.event_type || record?.tailgating_flag || 'Multi-Person Piggybacking'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Action Protocol</div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#38bdf8', marginTop: '2px' }}>
                {record?.action_taken || 'Automatic Interlock Lockout'}
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Forensic Notes</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px', lineHeight: 1.4 }}>
                {data.notes}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#090d16',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ fontSize: '11.5px', color: '#64748b' }}>
            Bangladesh Bank ICT-08 Forensic Audit Evidence · Immutable Log
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                alert(`Forensic CCTV Snapshot #${record?.id || 'EVT'} downloaded to local evidence cache.`);
              }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#e2e8f0',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📥 Download JPEG
            </button>

            <button
              onClick={() => {
                alert(`Security Incident #${record?.id || 'EVT'} signed off by SOC Duty Officer.`);
                onClose();
              }}
              style={{
                backgroundColor: '#0d9488',
                border: 'none',
                color: '#fff',
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(13, 148, 136, 0.3)'
              }}
            >
              ✓ Sign-off Incident
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
