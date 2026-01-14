package com.example.AniLog.Profile;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ListServiceTest {

    @Mock
    private ListsRepository listsRepository;

    @InjectMocks
    private ListService listService;

    private UserListItem testItem;
    private List<UserListItem> testList;

    @BeforeEach
    void setUp() {
        testItem = new UserListItem();
        testItem.setId(1L);
        testItem.setUserId(1L);
        testItem.setTitle("Demon Slayer");
        testItem.setType(UserListItem.MediaType.ANIME);
        testItem.setAnilistId(38000);
        testItem.setCoverImageUrl("https://example.com/image.jpg");
        testItem.setAddedDate(LocalDateTime.now());

        UserListItem testItem2 = new UserListItem();
        testItem2.setId(2L);
        testItem2.setUserId(1L);
        testItem2.setTitle("Attack on Titan");
        testItem2.setType(UserListItem.MediaType.ANIME);
        testItem2.setAnilistId(16498);
        testItem2.setCoverImageUrl("https://example.com/image2.jpg");
        testItem2.setAddedDate(LocalDateTime.now());

        testList = Arrays.asList(testItem, testItem2);
    }

    // GET Tests
    @Test
    void testGetUserListAnime() {
        when(listsRepository.findByUserIdAndType(1L, UserListItem.MediaType.ANIME))
            .thenReturn(testList);

        List<UserListItem> result = listService.getUserList(1L, "ANIME");

        assertEquals(testList, result);
        assertEquals(2, result.size());
        verify(listsRepository, times(1)).findByUserIdAndType(1L, UserListItem.MediaType.ANIME);
    }

    @Test
    void testGetUserListManga() {
        List<UserListItem> mangaList = Arrays.asList();
        when(listsRepository.findByUserIdAndType(1L, UserListItem.MediaType.MANGA))
            .thenReturn(mangaList);

        List<UserListItem> result = listService.getUserList(1L, "MANGA");

        assertEquals(mangaList, result);
        assertEquals(0, result.size());
        verify(listsRepository, times(1)).findByUserIdAndType(1L, UserListItem.MediaType.MANGA);
    }

    @Test
    void testGetUserListEmptyList() {
        when(listsRepository.findByUserIdAndType(2L, UserListItem.MediaType.ANIME))
            .thenReturn(Arrays.asList());

        List<UserListItem> result = listService.getUserList(2L, "ANIME");

        assertTrue(result.isEmpty());
        verify(listsRepository, times(1)).findByUserIdAndType(2L, UserListItem.MediaType.ANIME);
    }

    @Test
    void testGetUserListMultipleItems() {
        UserListItem item3 = new UserListItem();
        item3.setId(3L);
        item3.setUserId(1L);
        item3.setTitle("Jujutsu Kaisen");
        item3.setType(UserListItem.MediaType.ANIME);
        item3.setAnilistId(54589);

        List<UserListItem> largeList = Arrays.asList(testItem, testItem, item3);
        when(listsRepository.findByUserIdAndType(1L, UserListItem.MediaType.ANIME))
            .thenReturn(largeList);

        List<UserListItem> result = listService.getUserList(1L, "ANIME");

        assertEquals(3, result.size());
        verify(listsRepository, times(1)).findByUserIdAndType(1L, UserListItem.MediaType.ANIME);
    }

    // POST Tests - Add Item
    @Test
    void testAddItemToListSuccess() throws Exception {
        when(listsRepository.existsByUserIdAndTitleAndType(1L, "Demon Slayer", UserListItem.MediaType.ANIME))
            .thenReturn(false);
        when(listsRepository.save(any(UserListItem.class))).thenReturn(testItem);

        UserListItem result = listService.addItemToList(testItem);

        assertNotNull(result);
        assertEquals("Demon Slayer", result.getTitle());
        assertEquals(1L, result.getUserId());
        assertNotNull(result.getAddedDate());
        verify(listsRepository, times(1)).existsByUserIdAndTitleAndType(1L, "Demon Slayer", UserListItem.MediaType.ANIME);
        verify(listsRepository, times(1)).save(any(UserListItem.class));
    }

    @Test
    void testAddItemToListDuplicate() throws Exception {
        when(listsRepository.existsByUserIdAndTitleAndType(1L, "Demon Slayer", UserListItem.MediaType.ANIME))
            .thenReturn(true);

        Exception exception = assertThrows(Exception.class, () -> {
            listService.addItemToList(testItem);
        });

        assertEquals("Item already exists in the user's list", exception.getMessage());
        verify(listsRepository, times(1)).existsByUserIdAndTitleAndType(1L, "Demon Slayer", UserListItem.MediaType.ANIME);
        verify(listsRepository, never()).save(any());
    }

    @Test
    void testAddItemToListWithMangaType() throws Exception {
        UserListItem mangaItem = new UserListItem();
        mangaItem.setUserId(1L);
        mangaItem.setTitle("Attack on Titan Manga");
        mangaItem.setType(UserListItem.MediaType.MANGA);
        mangaItem.setAnilistId(16498);

        when(listsRepository.existsByUserIdAndTitleAndType(1L, "Attack on Titan Manga", UserListItem.MediaType.MANGA))
            .thenReturn(false);
        when(listsRepository.save(any(UserListItem.class))).thenReturn(mangaItem);

        UserListItem result = listService.addItemToList(mangaItem);

        assertNotNull(result);
        assertEquals(UserListItem.MediaType.MANGA, result.getType());
        verify(listsRepository, times(1)).save(any());
    }

    @Test
    void testAddItemToListSetsAddedDate() throws Exception {
        UserListItem itemWithoutDate = new UserListItem();
        itemWithoutDate.setUserId(1L);
        itemWithoutDate.setTitle("Test Anime");
        itemWithoutDate.setType(UserListItem.MediaType.ANIME);
        itemWithoutDate.setAddedDate(null);

        when(listsRepository.existsByUserIdAndTitleAndType(1L, "Test Anime", UserListItem.MediaType.ANIME))
            .thenReturn(false);
        when(listsRepository.save(any(UserListItem.class))).thenReturn(testItem);

        listService.addItemToList(itemWithoutDate);

        verify(listsRepository, times(1)).save(any(UserListItem.class));
    }

    @Test
    void testAddMultipleItemsToList() throws Exception {
        when(listsRepository.existsByUserIdAndTitleAndType(1L, "Demon Slayer", UserListItem.MediaType.ANIME))
            .thenReturn(false);
        when(listsRepository.save(testItem)).thenReturn(testItem);

        UserListItem result1 = listService.addItemToList(testItem);
        assertEquals("Demon Slayer", result1.getTitle());

        UserListItem testItem2 = new UserListItem();
        testItem2.setUserId(1L);
        testItem2.setTitle("Attack on Titan");
        testItem2.setType(UserListItem.MediaType.ANIME);
        testItem2.setAnilistId(16498);

        when(listsRepository.existsByUserIdAndTitleAndType(1L, "Attack on Titan", UserListItem.MediaType.ANIME))
            .thenReturn(false);
        when(listsRepository.save(testItem2)).thenReturn(testItem2);

        UserListItem result2 = listService.addItemToList(testItem2);
        assertEquals("Attack on Titan", result2.getTitle());

        verify(listsRepository, times(2)).save(any());
    }

    // DELETE Tests - Remove Item
    @Test
    void testRemoveItemFromListSuccess() throws Exception {
        when(listsRepository.findByUserIdAndAnilistId(1L, 38000)).thenReturn(testItem);
        doNothing().when(listsRepository).delete(testItem);

        listService.removeItemFromList(testItem);

        verify(listsRepository, times(1)).findByUserIdAndAnilistId(1L, 38000);
        verify(listsRepository, times(1)).delete(testItem);
    }

    @Test
    void testRemoveItemFromListNotFound() throws Exception {
        testItem.setAnilistId(99999);
        when(listsRepository.findByUserIdAndAnilistId(1L, 99999)).thenReturn(null);

        Exception exception = assertThrows(Exception.class, () -> {
            listService.removeItemFromList(testItem);
        });

        assertEquals("Item not found in the user's list", exception.getMessage());
        verify(listsRepository, times(1)).findByUserIdAndAnilistId(1L, 99999);
        verify(listsRepository, never()).delete(any());
    }

    @Test
    void testRemoveMultipleItems() throws Exception {
        when(listsRepository.findByUserIdAndAnilistId(1L, 38000)).thenReturn(testItem);
        doNothing().when(listsRepository).delete(testItem);

        listService.removeItemFromList(testItem);

        UserListItem testItem2 = new UserListItem();
        testItem2.setUserId(1L);
        testItem2.setAnilistId(16498);

        when(listsRepository.findByUserIdAndAnilistId(1L, 16498)).thenReturn(testItem2);
        doNothing().when(listsRepository).delete(testItem2);

        listService.removeItemFromList(testItem2);

        verify(listsRepository, times(2)).delete(any());
    }

    @Test
    void testRemoveItemAndAddNewItem() throws Exception {
        when(listsRepository.findByUserIdAndAnilistId(1L, 38000)).thenReturn(testItem);
        doNothing().when(listsRepository).delete(testItem);

        listService.removeItemFromList(testItem);

        UserListItem newItem = new UserListItem();
        newItem.setUserId(1L);
        newItem.setTitle("New Anime");
        newItem.setType(UserListItem.MediaType.ANIME);
        newItem.setAnilistId(12345);

        when(listsRepository.existsByUserIdAndTitleAndType(1L, "New Anime", UserListItem.MediaType.ANIME))
            .thenReturn(false);
        when(listsRepository.save(any(UserListItem.class))).thenReturn(newItem);

        UserListItem result = listService.addItemToList(newItem);

        assertEquals("New Anime", result.getTitle());
        verify(listsRepository, times(1)).delete(testItem);
        verify(listsRepository, times(1)).save(any());
    }
}
