import axios from 'axios';
import { HttpRequest } from 'axios-core';
import { RoleSM, UserSM } from 'onecore';
import { SearchBuilder } from 'query-core';
import { DatabaseManager } from 'sqlite-mobile';
import { SqlRoleService } from 'src/sqlite-mobile/role';
import { SqlUserService } from 'src/sqlite-mobile/user';
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
import { UserService } from './service/UserService';

const httpRequest = new HttpRequest(axios, options);
// @ts-ignore: Unreachable code error
const database = window.sqlitePlugin.openDatabase('database.db', '1.0', 'back office database', 1000000);
const sqlite = new DatabaseManager(database);
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
        const roleSearch = new SearchBuilder<Role, RoleSM>(sqlite.query, 'roles', roleModel.attributes);
        this.roleService = new SqlRoleService(roleSearch.search, param, sqlite.query, sqlite.exec, sqlite.execBatch);
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
        const userSearch = new SearchBuilder<User, UserSM>(sqlite.query, 'users', userModel.attributes);
        this.userService = new SqlUserService(userSearch.search, param, sqlite.query, sqlite.exec, sqlite.execBatch);
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
