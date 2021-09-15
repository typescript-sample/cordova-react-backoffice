import axios from 'axios';
import { HttpRequest } from 'axios-core';
import { RoleSM, UserSM } from 'onecore';
import { SearchBuilder } from 'query-core';
import { DatabaseManager } from 'sqlite-mobile';
import { copyDatabaseFile } from 'src/prepareDB/prepareDB';
import { options, storage } from 'uione';
import { roleModel } from './metadata/RoleModel';
import { userModel } from './metadata/UserModel';
import { Role } from './model/Role';
import { User } from './model/User';
import { ApprRoleAssignmentClient } from './service/client/ApprRoleAssignmentClient';
import { AuditClient } from './service/client/AuditClient';
import { MasterDataClient } from './service/client/MasterDataClient';
import { RoleAssignmentClient } from './service/client/RoleAssignmentClient';
import { RoleClient } from './service/client/RoleClient';
import { UserClient } from './service/client/UserClient';
import { MasterDataService } from './service/MasterDataService';
import { RoleService } from './service/RoleService';
import { SqlRoleService } from './service/sql/SqlRoleService';
import { SqlUserService } from './service/sql/SqlUserService';
import { UserService } from './service/UserService';

const httpRequest = new HttpRequest(axios, options);

export interface Config {
  user_url: string;
  role_url: string;
  audit_log_url: string;
}

export function param(i: number): string {
  return '$' + i;
}

export const resource = {
  offline: true
};
class ApplicationContext {
  private masterDataService: MasterDataService;
  private roleAssignmentService: RoleAssignmentClient;
  private apprRoleAssignmentService: ApprRoleAssignmentClient;
  private roleService: RoleService;
  private userService: UserService;
  private auditService: AuditClient;
  private sqlite: DatabaseManager;
  constructor() {
    if (resource.offline) {
      copyDatabaseFile('office.db').then(() => {
        // @ts-ignore: Unreachable code error
        const db = window.sqlitePlugin.openDatabase('office.db');
        this.sqlite = new DatabaseManager(db);
      });
    }
  }
  getConfig(): Config {
    return storage.config();
  }
  getMasterDataService(): MasterDataService {
    if (!this.masterDataService) {
      this.masterDataService = new MasterDataClient();
    }
    return this.masterDataService;
  }
  getRoleAssignmentService(): RoleAssignmentClient {
    if (!this.roleAssignmentService) {
      this.roleAssignmentService = new RoleAssignmentClient(httpRequest);
    }
    return this.roleAssignmentService;
  }
  getApprRoleAssignmentService(): ApprRoleAssignmentClient {
    if (!this.apprRoleAssignmentService) {
      this.apprRoleAssignmentService = new ApprRoleAssignmentClient(httpRequest);
    }
    return this.apprRoleAssignmentService;
  }
  getRoleService(): RoleService {
    if (!this.roleService) {
      const c = this.getConfig();
      if (resource.offline) {
        if (this.sqlite) {
          const roleSearch = new SearchBuilder<Role, RoleSM>(this.sqlite.query, 'roles', roleModel.attributes);
          this.roleService = new SqlRoleService(roleSearch.search, param, this.sqlite.query, this.sqlite.exec, this.sqlite.execBatch);
        }
      } else {
        this.roleService = new RoleClient(httpRequest, c.role_url);
      }
    }
    return this.roleService;
  }
  getUserService(): UserService {
    if (!this.userService) {
      const c = this.getConfig();
      if (resource.offline) {
        if (this.sqlite) {
          const userSearch = new SearchBuilder<User, UserSM>(this.sqlite.query, 'users', userModel.attributes);
          this.userService = new SqlUserService(userSearch.search, param, this.sqlite.query, this.sqlite.exec, this.sqlite.execBatch);
        }
      } else {
        this.userService = new UserClient(httpRequest, c.user_url);
      }
    }
    return this.userService;
  }
  getAuditService(): AuditClient {
    if (!this.auditService) {
      const c = this.getConfig();
      this.auditService = new AuditClient(httpRequest, c.audit_log_url);
    }
    return this.auditService;
  }
}

export const context = new ApplicationContext();
