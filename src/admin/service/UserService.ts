import { ResultInfo } from 'onecore';
import { GenericSearchService } from 'onecore';
import { User } from '../model/User';
import { UserSM } from '../search-model/UserSM';

export interface UserService extends GenericSearchService<User, number, number | ResultInfo<User>, UserSM> {
}
