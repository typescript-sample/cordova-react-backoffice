import { ResultInfo, UserSM } from 'onecore';
import { GenericSearchService } from 'onecore';
import { User } from '../model/User';

export interface UserService extends GenericSearchService<User, number, number | ResultInfo<User>, UserSM> {
}
