import unittest


class TestIndexToPart(unittest.TestCase):
    def test_all_17_landmarks_defined(self):
        from pose import INDEX_TO_PART
        self.assertEqual(len(INDEX_TO_PART), 17)

    def test_nose_is_index_0(self):
        from pose import INDEX_TO_PART
        self.assertEqual(INDEX_TO_PART[0], "nose")

    def test_left_wrist_is_index_15(self):
        from pose import INDEX_TO_PART
        self.assertEqual(INDEX_TO_PART[15], "left_wrist")

    def test_right_ankle_is_index_28(self):
        from pose import INDEX_TO_PART
        self.assertEqual(INDEX_TO_PART[28], "right_ankle")

    def test_all_part_names_are_strings(self):
        from pose import INDEX_TO_PART
        for idx, part in INDEX_TO_PART.items():
            self.assertIsInstance(part, str, f"index {idx} has non-string part name")

    def test_no_duplicate_part_names(self):
        from pose import INDEX_TO_PART
        names = list(INDEX_TO_PART.values())
        self.assertEqual(len(names), len(set(names)))


class TestExtractFramesSignature(unittest.TestCase):
    def test_extract_frames_is_callable(self):
        from pose import extract_frames
        self.assertTrue(callable(extract_frames))


if __name__ == "__main__":
    unittest.main()
