package com.placement.portal.service;

import com.placement.portal.model.AuditLog;
import com.placement.portal.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void logAction(String action, String performedBy, String details) {
        AuditLog log = new AuditLog(action, performedBy, details);
        auditLogRepository.save(log);
    }
}
