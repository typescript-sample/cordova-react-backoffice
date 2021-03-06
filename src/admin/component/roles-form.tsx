import { RoleSM, ValueText } from 'onecore';
import * as React from 'react';
import { buildFromUrl, DispatchWithCallback } from 'react-onex';
import PageSizeSelect from 'react-page-size-select';
import Pagination from 'react-pagination-x';
import {useHistory} from 'react-router-dom';
import { mergeSearchModel } from 'search-utilities';
import { pageSizes, SearchComponentState, useSearch } from 'src/core/hooks/useSearch';
import { handleError, inputSearch } from 'uione';
import { context } from '../app';
import { Role } from '../model/Role';

interface RoleSearch extends SearchComponentState<Role, RoleSM> {
  statusList: ValueText[];
}

const sm: RoleSM = {
  roleId: '',
  roleName: '',
};

const RoleSearch: RoleSearch = {
  statusList: [],
  list: [],
  model: sm
};

const initialize = (load: (s: RoleSM, auto?: boolean) => void, setPrivateState: DispatchWithCallback<RoleSearch>, c?: SearchComponentState<Role, RoleSM>) => {
  const masterDataService = context.getMasterDataService();
  Promise.all([
    masterDataService.getStatus()
  ]).then(values => {
    const s2 = mergeSearchModel(buildFromUrl(), sm, pageSizes, ['activate']);
    const [activationStatuses] = values;
    setPrivateState({ statusList: activationStatuses }, () => load(s2, true));
  }).catch(handleError);
};

const RolesForm = () => {
  const history = useHistory();
  const refForm = React.useRef();
  const getSearchModel = (): RoleSM => {
    return RoleSearch.model;
  };
  const p = {initialize, getSearchModel};
  const hooks = useSearch<Role, RoleSM, RoleSearch>(refForm, RoleSearch, context.getRoleService(), p, inputSearch());
  const { state, resource, component, updateState } = hooks;

  const edit = (e: any, id: string) => {
    e.preventDefault();
    history.push('roles/' + id );
  };

  return (
    <div className='view-container'>
        <header>
          <h2>{resource.role_list}</h2>
          {component.addable && <button type='button' id='btnNew' name='btnNew' className='btn-new' onClick={hooks.add} />}
        </header>
        <div>
          <form id='rolesForm' name='rolesForm' noValidate={true} ref={refForm}>
            <section className='row search-group inline'>
              <label className='col s12 m6'>
                {resource.role_name}
                <input
                  type='text'
                  id='roleName'
                  name='roleName'
                  value={state.model.roleName}
                  onChange={updateState}
                  maxLength={240}
                  placeholder={resource.roleName} />
              </label>
              <label className='col s12 m6'>
                {resource.status}
                <section className='checkbox-group'>
                  <label>
                    <input
                      type='checkbox'
                      id='active'
                      name='status'
                      value='A'
                      checked={state.model.status?.includes('A')}
                      onChange={updateState} />
                    {resource.active}
                  </label>
                  <label>
                    <input
                      type='checkbox'
                      id='inactive'
                      name='status'
                      value='I'
                      checked={state.model.status?.includes('I')}
                      onChange={updateState} />
                    {resource.inactive}
                  </label>
                </section>
              </label>
            </section>
            <section className='btn-group'>
              <label>
                {resource.page_size}
                <PageSizeSelect pageSize={component.pageSize} pageSizes={component.pageSizes} onPageSizeChanged={hooks.pageSizeChanged} />
              </label>
              <button type='submit' className='btn-search' onClick={hooks.searchOnClick}>{resource.search}</button>
            </section>
          </form>
          <form className='list-result'>
            <ul className='row list-view'>
            {state.list && state.list.length > 0 && state.list.map((item, i) => {
              return (
                <li key={i} className='col s12 m6 l4 xl3' onClick={e => edit(e, item.roleId)}>
                  <section>
                    <div>
                      <h3 className={item.status === 'I' ? 'inactive' : ''}>{item.roleName}</h3>
                      <p>{item.remark}</p>
                    </div>
                    <button className='btn-detail' />
                  </section>
                </li>
              );
            })}
            </ul>
            <Pagination className='col s12 m6' totalRecords={component.itemTotal} itemsPerPage={component.pageSize} maxSize={component.pageMaxSize} currentPage={component.pageIndex} onPageChanged={hooks.pageChanged} />
          </form>
        </div>
      </div>
  );
};
export default RolesForm;
